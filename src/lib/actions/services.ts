"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCurrentMembership } from "@/lib/permissions/get-current-membership";
import { canManageEmployeesAndServices } from "@/lib/permissions/roles";
import { serviceSchema } from "@/lib/validation/service";
import type { Service } from "@/types/database";

export async function listServices(businessId: string): Promise<Service[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("business_id", businessId)
    .order("price", { ascending: true });
  return data ?? [];
}

export async function createService(input: unknown) {
  const membership = await requireCurrentMembership();
  if (!canManageEmployeesAndServices(membership)) {
    return { error: "Faqat biznes egasi xizmat qo'sha oladi." };
  }

  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .insert({ ...parsed.data, business_id: membership.businessId });

  if (error) return { error: "Xizmat qo'shishda xatolik yuz berdi." };

  revalidatePath("/dashboard/services");
  return { success: true };
}

export async function updateService(serviceId: string, input: unknown) {
  const membership = await requireCurrentMembership();
  if (!canManageEmployeesAndServices(membership)) {
    return { error: "Faqat biznes egasi xizmatni o'zgartira oladi." };
  }

  const parsed = serviceSchema.partial().safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update(parsed.data)
    .eq("id", serviceId)
    .eq("business_id", membership.businessId);

  if (error) return { error: "Saqlashda xatolik yuz berdi." };

  revalidatePath("/dashboard/services");
  return { success: true };
}

export async function toggleServiceActive(serviceId: string, isActive: boolean) {
  return updateService(serviceId, { is_active: isActive });
}
