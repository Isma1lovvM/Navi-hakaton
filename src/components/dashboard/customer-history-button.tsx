"use client";

import { useState, useTransition } from "react";
import { History, X } from "lucide-react";
import { getCustomerBookings } from "@/lib/actions/bookings";
import { BookingCard } from "@/components/booking/booking-card";
import { EmptyState } from "@/components/layout/empty-state";
import type { BookingWithDetails } from "@/types/database";

export function CustomerHistoryButton({ customerId, customerName }: { customerId: string; customerName: string }) {
  const [open, setOpen] = useState(false);
  const [bookings, setBookings] = useState<BookingWithDetails[] | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpen = () => {
    setOpen(true);
    if (bookings === null) {
      startTransition(async () => {
        const data = await getCustomerBookings(customerId);
        setBookings(data);
      });
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-accent-500 hover:text-accent-700"
      >
        <History className="h-3.5 w-3.5" /> Tarix
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-card bg-surface p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">{customerName} — bookinglar</h2>
              <button onClick={() => setOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-surface-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            {isPending || bookings === null ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-card border border-border bg-surface-muted" />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <EmptyState title="Booking tarixi yo'q" />
            ) : (
              <div className="space-y-2">
                {bookings.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
