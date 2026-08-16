"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { requireCurrentMembership } from "@/lib/permissions/get-current-membership";
import { canManageEmployeesAndServices } from "@/lib/permissions/roles";
import { employeeInviteSchema, resourceHoursDaySchema } from "@/lib/validation/employee";
import type { BusinessMember, Resource, ResourceHours } from "@/types/database";

export interface EmployeeWithResource extends BusinessMember {
  resource: Pick<Resource, "id" | "name" | "type" | "is_active"> | null;
  profile: { full_name: string; phone: string | null } | null;
}

export async function listEmployees(businessId: string): Promise<EmployeeWithResource[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("business_members")
    .select("*, resource:resources(id, name, type, is_active), profile:profiles(full_name, phone)")
    .eq("business_id", businessId)
    .eq("role", "EMPLOYEE")
    .order("created_at", { ascending: true });
  return (data as EmployeeWithResource[] | null) ?? [];
}

export async function getResourceHours(resourceId: string): Promise<ResourceHours[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("resource_hours")
    .select("*")
    .eq("resource_id", resourceId)
    .order("day_of_week", { ascending: true });
  return data ?? [];
}

/**
 * Creates an employee end-to-end: auth user (service role, since inviting
 * someone who doesn't have an account yet is an admin action) + resource +
 * business_members row. Kept in one action so the three inserts either all
 * happen or the caller sees one clear error.
 */
export async function createEmployee(input: unknown) {
  const membership = await requireCurrentMembership();
  if (!canManageEmployeesAndServices(membership)) {
    return { error: "Faqat biznes egasi xodim qo'sha oladi." };
  }

  const parsed = employeeInviteSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri." };
  }

  const admin = createServiceRoleClient();

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.full_name, phone: parsed.data.phone },
  });

  if (createErr || !created.user) {
    return { error: "Xodim uchun akkaunt yaratib bo'lmadi (email band bo'lishi mumkin)." };
  }

  const supabase = await createClient();

  const { data: resource, error: resourceErr } = await supabase
    .from("resources")
    .insert({ business_id: membership.businessId, name: parsed.data.resource_name, type: "BARBER" })
    .select()
    .single();

  if (resourceErr || !resource) return { error: "Resurs (usta) yaratib bo'lmadi." };

  const { error: memberErr } = await supabase.from("business_members").insert({
    business_id: membership.businessId,
    profile_id: created.user.id,
    role: "EMPLOYEE",
    resource_id: resource.id,
  });

  if (memberErr) return { error: "Xodimni biznesga bog'lashda xatolik." };

  revalidatePath("/dashboard/employees");
  return { success: true };
}

export async function toggleEmployeeActive(memberId: string, resourceId: string | null, isActive: boolean) {
  const membership = await requireCurrentMembership();
  if (!canManageEmployeesAndServices(membership)) {
    return { error: "Faqat biznes egasi xodim holatini o'zgartira oladi." };
  }

  const supabase = await createClient();

  const { error: memberErr } = await supabase
    .from("business_members")
    .update({ is_active: isActive })
    .eq("id", memberId)
    .eq("business_id", membership.businessId);

  if (memberErr) return { error: "Xodim holatini yangilashda xatolik." };

  if (resourceId) {
    await supabase.from("resources").update({ is_active: isActive }).eq("id", resourceId);
  }

  revalidatePath("/dashboard/employees");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateResourceHoursDay(resourceId: string, input: unknown) {
  const membership = await requireCurrentMembership();
  if (!canManageEmployeesAndServices(membership)) {
    return { error: "Faqat biznes egasi ish vaqtlarini o'zgartira oladi." };
  }

  const parsed = resourceHoursDaySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("resource_hours")
    .update({
      is_off: parsed.data.is_off,
      start_time: parsed.data.start_time,
      end_time: parsed.data.end_time,
    })
    .eq("resource_id", resourceId)
    .eq("day_of_week", parsed.data.day_of_week);

  if (error) return { error: "Saqlashda xatolik yuz berdi." };

  revalidatePath("/dashboard/employees");
  return { success: true };
}
