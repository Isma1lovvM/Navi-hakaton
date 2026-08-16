"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCurrentMembership } from "@/lib/permissions/get-current-membership";
import { canActOnBooking } from "@/lib/permissions/roles";
import {
  ALLOWED_STATUS_TRANSITIONS,
  bookingStatusTransitionSchema,
  staffCreateBookingSchema,
} from "@/lib/validation/booking";
import type { BookingStatus, BookingWithDetails } from "@/types/database";

const DETAIL_SELECT =
  "*, customer:customers(id, full_name, phone), resource:resources(id, name), service:services(id, name, duration_minutes, price)";

export async function getTodaySchedule(businessId: string): Promise<BookingWithDetails[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("bookings")
    .select(DETAIL_SELECT)
    .eq("business_id", businessId)
    .eq("date", today)
    .order("start_at", { ascending: true });

  if (error) return [];
  return (data as unknown as BookingWithDetails[]) ?? [];
}

export async function listBookings(
  businessId: string,
  filters?: { status?: BookingStatus; from?: string; to?: string }
): Promise<BookingWithDetails[]> {
  const supabase = await createClient();
  let query = supabase
    .from("bookings")
    .select(DETAIL_SELECT)
    .eq("business_id", businessId)
    .order("start_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.from) query = query.gte("date", filters.from);
  if (filters?.to) query = query.lte("date", filters.to);

  const { data, error } = await query.limit(100);
  if (error) return [];
  return (data as unknown as BookingWithDetails[]) ?? [];
}

export async function getCustomerBookings(customerId: string): Promise<BookingWithDetails[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(DETAIL_SELECT)
    .eq("customer_id", customerId)
    .order("start_at", { ascending: false })
    .limit(20);

  if (error) return [];
  return (data as unknown as BookingWithDetails[]) ?? [];
}

export async function getEmployeeQueue(resourceId: string): Promise<BookingWithDetails[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("bookings")
    .select(DETAIL_SELECT)
    .eq("resource_id", resourceId)
    .eq("date", today)
    .in("status", ["CONFIRMED", "IN_PROGRESS"])
    .order("start_at", { ascending: true });

  if (error) return [];
  return (data as unknown as BookingWithDetails[]) ?? [];
}

export async function createStaffBooking(input: unknown) {
  const membership = await requireCurrentMembership();
  const parsed = staffCreateBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri." };
  }

  const supabase = await createClient();

  let customerId = parsed.data.customer_id ?? null;
  if (!customerId && parsed.data.customer_name && parsed.data.customer_phone) {
    const { data: customer, error: customerErr } = await supabase
      .from("customers")
      .upsert(
        {
          business_id: membership.businessId,
          full_name: parsed.data.customer_name,
          phone: parsed.data.customer_phone,
        },
        { onConflict: "business_id,phone" }
      )
      .select()
      .single();
    if (customerErr || !customer) return { error: "Mijoz ma'lumotini saqlab bo'lmadi." };
    customerId = customer.id;
  }

  if (!customerId) return { error: "Mijozni tanlang yoki ma'lumotini kiriting." };

  const { data: service } = await supabase
    .from("services")
    .select("duration_minutes")
    .eq("id", parsed.data.service_id)
    .single();
  if (!service) return { error: "Xizmat topilmadi." };

  const startAt = new Date(parsed.data.start_at);
  const endAt = new Date(startAt.getTime() + service.duration_minutes * 60_000);

  const { error: bookingErr } = await supabase.from("bookings").insert({
    business_id: membership.businessId,
    customer_id: customerId,
    resource_id: parsed.data.resource_id,
    service_id: parsed.data.service_id,
    start_at: startAt.toISOString(),
    end_at: endAt.toISOString(),
    status: "CONFIRMED",
    payment_status: "UNPAID",
  });

  if (bookingErr) {
    if (bookingErr.code === "23P01") {
      return { error: "Bu vaqt band. Boshqa vaqtni tanlang." };
    }
    return { error: "Booking yaratishda xatolik yuz berdi." };
  }

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateBookingStatus(input: unknown) {
  const membership = await requireCurrentMembership();
  const parsed = bookingStatusTransitionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri." };
  }

  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, status, resource_id")
    .eq("id", parsed.data.booking_id)
    .eq("business_id", membership.businessId)
    .single();

  if (!booking) return { error: "Booking topilmadi." };
  if (!canActOnBooking(membership, booking.resource_id)) {
    return { error: "Bu bookingni o'zgartirishga ruxsatingiz yo'q." };
  }

  const allowed = ALLOWED_STATUS_TRANSITIONS[booking.status as BookingStatus] ?? [];
  if (!allowed.includes(parsed.data.status)) {
    return { error: `"${booking.status}" holatidan "${parsed.data.status}"ga o'tish mumkin emas.` };
  }

  const { error } = await supabase
    .from("bookings")
    .update({
      status: parsed.data.status,
      cancelled_reason: parsed.data.cancelled_reason ?? null,
    })
    .eq("id", booking.id);

  if (error) return { error: "Holatni yangilashda xatolik yuz berdi." };

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
  revalidatePath("/employee");
  return { success: true };
}
