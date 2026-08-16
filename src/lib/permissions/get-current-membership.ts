import { createClient } from "@/lib/supabase/server";
import type { CurrentMembership } from "@/lib/permissions/roles";

/**
 * Reads the logged-in user's membership (business + role + resource) from
 * `business_members`. Returns null when signed out or not a member of any
 * business yet. Every server action that mutates business data should call
 * this first and check the returned role via the helpers in roles.ts.
 */
export async function getCurrentMembership(): Promise<CurrentMembership | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("business_members")
    .select("business_id, role, resource_id")
    .eq("profile_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    businessId: data.business_id,
    role: data.role,
    resourceId: data.resource_id,
  };
}

export async function requireCurrentMembership(): Promise<CurrentMembership> {
  const membership = await getCurrentMembership();
  if (!membership) throw new Error("UNAUTHENTICATED");
  return membership;
}
