"use server";

import { createClient } from "@/lib/supabase/server";
import type { Customer } from "@/types/database";

export interface CustomerWithStats extends Customer {
  bookingsCount: number;
}

export async function listCustomers(businessId: string): Promise<CustomerWithStats[]> {
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (!customers) return [];

  const { data: bookings } = await supabase
    .from("bookings")
    .select("customer_id")
    .eq("business_id", businessId);

  const counts = new Map<string, number>();
  for (const b of bookings ?? []) {
    counts.set(b.customer_id, (counts.get(b.customer_id) ?? 0) + 1);
  }

  return customers.map((c) => ({ ...c, bookingsCount: counts.get(c.id) ?? 0 }));
}
