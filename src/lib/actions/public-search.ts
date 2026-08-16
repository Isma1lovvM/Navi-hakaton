"use server";

import { createClient } from "@/lib/supabase/server";
import type { Business } from "@/types/database";

export async function searchBusinesses(query?: string): Promise<Business[]> {
  const supabase = await createClient();
  let request = supabase.from("businesses").select("*").eq("is_active", true).order("name");

  if (query && query.trim().length > 0) {
    request = request.ilike("name", `%${query.trim()}%`);
  }

  const { data } = await request.limit(20);
  return data ?? [];
}
