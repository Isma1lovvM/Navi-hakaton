"use server";

import { createClient } from "@/lib/supabase/server";

export interface DailyReport {
  revenue: number;
  bookingsCount: number;
  completed: number;
  cancelled: number;
  noShow: number;
  uniqueCustomers: number;
}

export async function getDailyReport(businessId: string, date?: string): Promise<DailyReport> {
  const supabase = await createClient();
  const day = date ?? new Date().toISOString().slice(0, 10);

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, status, customer_id")
    .eq("business_id", businessId)
    .eq("date", day);

  const { data: payments } = await supabase
    .from("payments")
    .select("amount, booking:bookings!inner(business_id, date)")
    .eq("booking.business_id", businessId)
    .eq("booking.date", day);

  const revenue = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
  const rows = bookings ?? [];

  return {
    revenue,
    bookingsCount: rows.length,
    completed: rows.filter((b) => b.status === "COMPLETED").length,
    cancelled: rows.filter((b) => b.status === "CANCELLED").length,
    noShow: rows.filter((b) => b.status === "NO_SHOW").length,
    uniqueCustomers: new Set(rows.map((b) => b.customer_id)).size,
  };
}

export interface WeeklyRevenuePoint {
  date: string;
  label: string;
  revenue: number;
}

export async function getWeeklyRevenue(businessId: string): Promise<WeeklyRevenuePoint[]> {
  const supabase = await createClient();
  const today = new Date();
  const days: WeeklyRevenuePoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    days.push({ date: iso, label: iso.slice(5), revenue: 0 });
  }

  const from = days[0]!.date;
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, booking:bookings!inner(business_id, date)")
    .eq("booking.business_id", businessId)
    .gte("booking.date", from);

  for (const p of payments ?? []) {
    const bookingDate = (p.booking as unknown as { date: string }).date;
    const point = days.find((d) => d.date === bookingDate);
    if (point) point.revenue += Number(p.amount);
  }

  return days;
}
