"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCurrentMembership } from "@/lib/permissions/get-current-membership";
import { canRecordPayment } from "@/lib/permissions/roles";
import { recordPaymentSchema } from "@/lib/validation/booking";
import type { Payment } from "@/types/database";

export interface PaymentWithBooking extends Payment {
  booking: { id: string; customer: { full_name: string } | null } | null;
}

export async function listPayments(businessId: string): Promise<PaymentWithBooking[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("*, booking:bookings(id, customer:customers(full_name))")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data as unknown as PaymentWithBooking[]) ?? [];
}

export async function recordPayment(input: unknown) {
  const membership = await requireCurrentMembership();
  if (!canRecordPayment(membership)) {
    return { error: "To'lov yozishga ruxsatingiz yo'q." };
  }

  const parsed = recordPaymentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri." };
  }

  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, service:services(price)")
    .eq("id", parsed.data.booking_id)
    .eq("business_id", membership.businessId)
    .single();

  if (!booking) return { error: "Booking topilmadi." };

  const { data: existingPayments } = await supabase
    .from("payments")
    .select("amount")
    .eq("booking_id", booking.id);

  const { error: paymentErr } = await supabase.from("payments").insert({
    business_id: membership.businessId,
    booking_id: parsed.data.booking_id,
    amount: parsed.data.amount,
    method: parsed.data.method,
  });

  if (paymentErr) return { error: "To'lovni saqlashda xatolik yuz berdi." };

  const servicePrice = (booking.service as unknown as { price: number } | null)?.price ?? 0;
  const totalPaid = (existingPayments ?? []).reduce((sum, p) => sum + Number(p.amount), 0) + parsed.data.amount;
  const newStatus = totalPaid >= servicePrice ? "PAID" : "PARTIAL";

  await supabase.from("bookings").update({ payment_status: newStatus }).eq("id", booking.id);

  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
  return { success: true };
}
