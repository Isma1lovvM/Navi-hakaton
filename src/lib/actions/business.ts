"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCurrentMembership } from "@/lib/permissions/get-current-membership";
import { canManageBusinessSettings } from "@/lib/permissions/roles";
import { businessHoursDaySchema, businessSchema } from "@/lib/validation/business";
import type { Business, BusinessHours } from "@/types/database";

export async function getMyBusiness(): Promise<Business | null> {
  const membership = await requireCurrentMembership();
  const supabase = await createClient();
  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", membership.businessId)
    .single();
  return data;
}

export async function getBusinessHours(businessId: string): Promise<BusinessHours[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("business_hours")
    .select("*")
    .eq("business_id", businessId)
    .order("day_of_week", { ascending: true });
  return data ?? [];
}

export async function updateBusinessProfile(input: unknown) {
  const membership = await requireCurrentMembership();
  if (!canManageBusinessSettings(membership)) {
    return { error: "Faqat biznes egasi sozlamalarni o'zgartira oladi." };
  }

  const parsed = businessSchema.partial().safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("businesses")
    .update(parsed.data)
    .eq("id", membership.businessId);

  if (error) return { error: "Saqlashda xatolik yuz berdi." };

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateBusinessHoursDay(input: unknown) {
  const membership = await requireCurrentMembership();
  if (!canManageBusinessSettings(membership)) {
    return { error: "Faqat biznes egasi ish vaqtlarini o'zgartira oladi." };
  }

  const parsed = businessHoursDaySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("business_hours")
    .update({
      is_closed: parsed.data.is_closed,
      open_time: parsed.data.open_time,
      close_time: parsed.data.close_time,
      break_start: parsed.data.break_start ?? null,
      break_end: parsed.data.break_end ?? null,
    })
    .eq("business_id", membership.businessId)
    .eq("day_of_week", parsed.data.day_of_week);

  if (error) return { error: "Saqlashda xatolik yuz berdi." };

  revalidatePath("/dashboard/settings");
  return { success: true };
}
