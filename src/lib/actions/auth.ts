"use server";

import { createClient } from "@/lib/supabase/server";

export async function signInWithPassword(email: string, password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Email yoki parol noto'g'ri." };
  return { success: true };
}

export async function signUpWithPassword(email: string, password: string, fullName: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) return { error: "Ro'yxatdan o'tishda xatolik: " + error.message };
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

/** After login, send OWNER/EMPLOYEE to the dashboard, EMPLOYEE straight to
 * their own reduced screen if you prefer — kept simple: both land on
 * /dashboard, employees just see fewer sidebar items in practice via RLS. */
export async function getPostLoginRedirect(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "/auth/login";

  const { data: membership } = await supabase
    .from("business_members")
    .select("role")
    .eq("profile_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!membership) return "/";
  return membership.role === "EMPLOYEE" ? "/employee" : "/dashboard";
}
