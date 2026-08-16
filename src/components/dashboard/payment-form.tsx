"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { recordPayment } from "@/lib/actions/payments";
import type { BookingWithDetails } from "@/types/database";

export function PaymentForm({ unpaidBookings }: { unpaidBookings: BookingWithDetails[] }) {
  const [bookingId, setBookingId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"CASH" | "CARD">("CASH");
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    startTransition(async () => {
      const result = await recordPayment({ booking_id: bookingId, amount: Number(amount), method });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("To'lov yozildi");
      setBookingId("");
      setAmount("");
    });
  };

  return (
    <div className="mb-6 flex flex-wrap items-end gap-3 rounded-card border border-border bg-surface p-4">
      <div className="min-w-[220px] flex-1">
        <label className="mb-1 block text-sm font-medium text-slate-700">Booking</label>
        <select
          value={bookingId}
          onChange={(e) => {
            setBookingId(e.target.value);
            const b = unpaidBookings.find((x) => x.id === e.target.value);
            if (b) setAmount(String(b.service.price));
          }}
          className="w-full rounded-md border border-border px-3 py-2 text-sm"
        >
          <option value="">Tanlang...</option>
          {unpaidBookings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.customer.full_name} — {b.service.name} ({b.service.price.toLocaleString("uz-UZ")} so&apos;m)
            </option>
          ))}
        </select>
      </div>
      <div className="w-32">
        <label className="mb-1 block text-sm font-medium text-slate-700">Summa</label>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" className="w-full rounded-md border border-border px-3 py-2 text-sm" />
      </div>
      <div className="w-32">
        <label className="mb-1 block text-sm font-medium text-slate-700">Usul</label>
        <select value={method} onChange={(e) => setMethod(e.target.value as "CASH" | "CARD")} className="w-full rounded-md border border-border px-3 py-2 text-sm">
          <option value="CASH">Naqd</option>
          <option value="CARD">Karta</option>
        </select>
      </div>
      <button
        onClick={submit}
        disabled={!bookingId || !amount || isPending}
        className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-60"
      >
        {isPending ? "Saqlanmoqda..." : "To'lovni yozish"}
      </button>
    </div>
  );
}
