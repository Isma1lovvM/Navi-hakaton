"use server";

import { createClient } from "@/lib/supabase/server";
import { createBookingSchema } from "@/lib/validation/booking";
import {
  businessHoursToDayHours,
  getAvailableSlots,
  resourceHoursToDayHours,
} from "@/lib/booking/availability";
import type {
  BookAppointmentResult,
  Business,
  BusinessHours,
  DayOfWeek,
  Resource,
  ResourceHours,
  Service,
} from "@/types/database";

export interface PublicBusinessBundle {
  business: Business;
  services: Service[];
  resources: Resource[];
  businessHours: BusinessHours[];
}

export async function getPublicBusiness(slug: string): Promise<PublicBusinessBundle | null> {
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!business) return null;

  const [{ data: services }, { data: resources }, { data: businessHours }] = await Promise.all([
    supabase.from("services").select("*").eq("business_id", business.id).eq("is_active", true).order("price"),
    supabase.from("resources").select("*").eq("business_id", business.id).eq("is_active", true).order("name"),
    supabase.from("business_hours").select("*").eq("business_id", business.id),
  ]);

  return {
    business,
    services: services ?? [],
    resources: resources ?? [],
    businessHours: businessHours ?? [],
  };
}

export async function getResourceHoursForDay(
  resourceId: string
): Promise<ResourceHours[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("resource_hours").select("*").eq("resource_id", resourceId);
  return data ?? [];
}

export async function getBookedRangesForResourceOnDate(
  resourceId: string,
  date: string
): Promise<{ startAt: string; endAt: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("start_at, end_at")
    .eq("resource_id", resourceId)
    .eq("date", date)
    .not("status", "in", "(CANCELLED,NO_SHOW)");

  return (data ?? []).map((b) => ({ startAt: b.start_at, endAt: b.end_at }));
}

export interface AvailableSlot {
  startAt: string;
  endAt: string;
  label: string;
}

/**
 * Computes bookable start times for one resource+service+date, using the
 * shared getAvailableSlots() engine (src/lib/booking/availability.ts) —
 * fetches the day's business_hours/resource_hours/existing bookings here,
 * math happens in the pure function.
 */
export async function getAvailableSlotsForSelection(input: {
  businessId: string;
  resourceId: string;
  serviceId: string;
  date: string; // "YYYY-MM-DD"
  timezone: string;
}): Promise<AvailableSlot[]> {
  const supabase = await createClient();
  const [y, m, d] = input.date.split("-").map(Number);
  const dayOfWeek = new Date(y, m - 1, d).getDay() as DayOfWeek;

  const [{ data: service }, { data: businessHoursRow }, { data: resourceHoursRow }, bookedRanges] =
    await Promise.all([
      supabase.from("services").select("duration_minutes").eq("id", input.serviceId).single(),
      supabase
        .from("business_hours")
        .select("*")
        .eq("business_id", input.businessId)
        .eq("day_of_week", dayOfWeek)
        .single(),
      supabase
        .from("resource_hours")
        .select("*")
        .eq("resource_id", input.resourceId)
        .eq("day_of_week", dayOfWeek)
        .single(),
      getBookedRangesForResourceOnDate(input.resourceId, input.date),
    ]);

  if (!service || !businessHoursRow || !resourceHoursRow) return [];

  const slots = getAvailableSlots({
    date: input.date,
    timezone: input.timezone,
    businessHours: businessHoursToDayHours(businessHoursRow),
    resourceHours: resourceHoursToDayHours(resourceHoursRow),
    serviceDurationMinutes: service.duration_minutes,
    existingBookings: bookedRanges,
  });

  return slots.map((s) => ({ startAt: s.startAt.toISOString(), endAt: s.endAt.toISOString(), label: s.label }));
}

export type BookAppointmentActionResult =
  | { success: true; booking: BookAppointmentResult }
  | { success: false; errorCode: string; message: string };

/**
 * The ONLY entry point for customer-created bookings. Wraps the
 * book_appointment() Postgres RPC (see supabase/schema.sql) — never
 * inserts into `bookings` directly from application code either.
 */
export async function submitBooking(input: unknown): Promise<BookAppointmentActionResult> {
  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      errorCode: "INVALID_INPUT",
      message: parsed.error.issues[0]?.message ?? "Ma'lumotlarni tekshiring.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("book_appointment", {
    p_business_id: parsed.data.business_id,
    p_resource_id: parsed.data.resource_id,
    p_service_id: parsed.data.service_id,
    p_start_at: parsed.data.start_at,
    p_customer_name: parsed.data.customer_name,
    p_customer_phone: parsed.data.customer_phone,
    p_notes: parsed.data.notes ?? null,
  });

  if (error) {
    const code = error.message as string;
    const messages: Record<string, string> = {
      SLOT_TAKEN: "Bu vaqt boshqa mijoz tomonidan band qilindi. Iltimos, boshqa vaqtni tanlang.",
      SERVICE_NOT_FOUND: "Bu xizmat mavjud emas. Sahifani yangilab ko'ring.",
      RESOURCE_NOT_FOUND: "Bu usta mavjud emas. Sahifani yangilab ko'ring.",
    };
    return {
      success: false,
      errorCode: code in messages ? code : "UNKNOWN",
      message: messages[code] ?? "Nimadir xato ketdi. Iltimos, qayta urinib ko'ring.",
    };
  }

  return { success: true, booking: data as BookAppointmentResult };
}
