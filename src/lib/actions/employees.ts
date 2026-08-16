"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { requireCurrentMembership } from "@/lib/permissions/get-current-membership";
import { canManageEmployeesAndServices } from "@/lib/permissions/roles";
import { employeeEditSchema, employeeInviteSchema, resourceHoursDaySchema } from "@/lib/validation/employee";
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

/** Same as getResourceHours but batched for the employees list page, so it
 * doesn't fire one query per employee. Returns a map keyed by resource_id. */
export async function listResourceHoursForResources(
  resourceIds: string[]
): Promise<Record<string, ResourceHours[]>> {
  if (resourceIds.length === 0) return {};

  const supabase = await createClient();
  const { data } = await supabase
    .from("resource_hours")
    .select("*")
    .in("resource_id", resourceIds)
    .order("day_of_week", { ascending: true });

  const byResource: Record<string, ResourceHours[]> = {};
  for (const row of (data as ResourceHours[] | null) ?? []) {
    (byResource[row.resource_id] ??= []).push(row);
  }
  return byResource;
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

  // resource_hours'ni ham shu yerda urug'lantiramiz — aks holda yangi xodim
  // uchun updateResourceHoursDay() UPDATE qiladigan hech qanday qator
  // bo'lmaydi (0 qator o'zgaradi, jimgina hech narsa saqlanmaydi). Biznesning
  // haftalik jadvalini boshlang'ich qiymat sifatida olamiz, topilmasa
  // standart 09:00-21:00 (yakshanba dam) bilan boshlaymiz.
  const hoursErr = await seedDefaultResourceHours(supabase, membership.businessId, resource.id);
  if (hoursErr) {
    // Xodim + resurs allaqachon yaratilgan — bu qadam muvaffaqiyatsiz bo'lsa
    // ham butun amalni bekor qilmaymiz, egasi keyinroq "Ish vaqtlari"
    // bo'limidan qo'lda sozlashi mumkin.
  }

  revalidatePath("/dashboard/employees");
  return { success: true };
}

/** Inserts one resource_hours row per weekday for a freshly created resource,
 * mirroring the business's own weekly hours when they exist. Returns an
 * error object on failure, or null on success (best-effort, non-fatal). */
async function seedDefaultResourceHours(
  supabase: Awaited<ReturnType<typeof createClient>>,
  businessId: string,
  resourceId: string
): Promise<{ message: string } | null> {
  const { data: businessHours } = await supabase
    .from("business_hours")
    .select("day_of_week, is_closed, open_time, close_time")
    .eq("business_id", businessId);

  const rows =
    businessHours && businessHours.length > 0
      ? businessHours.map((h) => ({
          resource_id: resourceId,
          day_of_week: h.day_of_week,
          is_off: h.is_closed,
          start_time: h.is_closed ? null : h.open_time,
          end_time: h.is_closed ? null : h.close_time,
        }))
      : [0, 1, 2, 3, 4, 5, 6].map((day) => ({
          resource_id: resourceId,
          day_of_week: day,
          is_off: day === 0,
          start_time: day === 0 ? null : "09:00",
          end_time: day === 0 ? null : "21:00",
        }));

  const { error } = await supabase.from("resource_hours").insert(rows);
  return error ? { message: error.message } : null;
}

/** For resources created before this seeding existed (or if seeding failed) —
 * lets the owner backfill default hours from the "Ish vaqtlari" panel. */
export async function initResourceHoursDefaults(resourceId: string) {
  const membership = await requireCurrentMembership();
  if (!canManageEmployeesAndServices(membership)) {
    return { error: "Faqat biznes egasi ish vaqtlarini sozlashi mumkin." };
  }

  const supabase = await createClient();
  const { data: resource } = await supabase
    .from("resources")
    .select("id")
    .eq("id", resourceId)
    .eq("business_id", membership.businessId)
    .maybeSingle();

  if (!resource) return { error: "Xodim topilmadi." };

  const hoursErr = await seedDefaultResourceHours(supabase, membership.businessId, resourceId);
  if (hoursErr) return { error: "Ish vaqtlarini yaratishda xatolik." };

  revalidatePath("/dashboard/employees");
  return { success: true };
}

/**
 * Edits an existing employee's display name/phone (on `profiles`, which is
 * why this needs the service-role client — RLS only lets people update
 * their own profile) and their resource name (on `resources`, which the
 * owner IS allowed to write via RLS). `memberId` is resolved to the right
 * resource/profile server-side so a caller can't pass someone else's ids.
 */
export async function updateEmployee(memberId: string, input: unknown) {
  const membership = await requireCurrentMembership();
  if (!canManageEmployeesAndServices(membership)) {
    return { error: "Faqat biznes egasi xodimni tahrirlay oladi." };
  }

  const parsed = employeeEditSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri." };
  }

  const supabase = await createClient();
  const { data: member } = await supabase
    .from("business_members")
    .select("id, profile_id, resource_id")
    .eq("id", memberId)
    .eq("business_id", membership.businessId)
    .eq("role", "EMPLOYEE")
    .maybeSingle();

  if (!member || !member.resource_id) return { error: "Xodim topilmadi." };

  const { error: resourceErr } = await supabase
    .from("resources")
    .update({ name: parsed.data.resource_name })
    .eq("id", member.resource_id)
    .eq("business_id", membership.businessId);

  if (resourceErr) return { error: "Xodim ma'lumotlarini saqlashda xatolik." };

  const admin = createServiceRoleClient();
  const { error: profileErr } = await admin
    .from("profiles")
    .update({ full_name: parsed.data.full_name, phone: parsed.data.phone ?? null })
    .eq("id", member.profile_id);

  if (profileErr) return { error: "Xodim ma'lumotlarini saqlashda xatolik." };

  revalidatePath("/dashboard/employees");
  return { success: true };
}

/**
 * Soft-delete/restore: deactivates the membership AND the underlying
 * resource together (so the barber both loses dashboard access and stops
 * being bookable), without touching booking history — nothing is deleted,
 * `bookings.resource_id` keeps pointing at a real row either way.
 */
export async function setEmployeeActive(memberId: string, isActive: boolean) {
  const membership = await requireCurrentMembership();
  if (!canManageEmployeesAndServices(membership)) {
    return { error: "Faqat biznes egasi xodim holatini o'zgartira oladi." };
  }

  const supabase = await createClient();
  const { data: member } = await supabase
    .from("business_members")
    .select("id, resource_id")
    .eq("id", memberId)
    .eq("business_id", membership.businessId)
    .eq("role", "EMPLOYEE")
    .maybeSingle();

  if (!member) return { error: "Xodim topilmadi." };

  const { error: memberErr } = await supabase
    .from("business_members")
    .update({ is_active: isActive })
    .eq("id", member.id)
    .eq("business_id", membership.businessId);

  if (memberErr) return { error: "Xodim holatini o'zgartirishda xatolik." };

  if (member.resource_id) {
    const { error: resourceErr } = await supabase
      .from("resources")
      .update({ is_active: isActive })
      .eq("id", member.resource_id)
      .eq("business_id", membership.businessId);

    if (resourceErr) return { error: "Xodim holatini o'zgartirishda xatolik." };
  }

  revalidatePath("/dashboard/employees");
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
