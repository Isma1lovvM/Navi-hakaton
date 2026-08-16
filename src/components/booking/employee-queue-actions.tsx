"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateBookingStatus } from "@/lib/actions/bookings";
import type { BookingStatus } from "@/types/database";

export function EmployeeQueueActions({ bookingId, status }: { bookingId: string; status: BookingStatus }) {
  const [isPending, startTransition] = useTransition();

  const apply = (next: BookingStatus) => {
    startTransition(async () => {
      const result = await updateBookingStatus({ booking_id: bookingId, status: next });
      if (result.error) toast.error(result.error);
    });
  };

  if (status === "CONFIRMED") {
    return (
      <button
        disabled={isPending}
        onClick={() => apply("IN_PROGRESS")}
        className="w-full rounded-md bg-accent-600 py-3 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-60"
      >
        Xizmatni boshlash
      </button>
    );
  }

  if (status === "IN_PROGRESS") {
    return (
      <div className="flex gap-2">
        <button
          disabled={isPending}
          onClick={() => apply("COMPLETED")}
          className="flex-1 rounded-md bg-accent-600 py-3 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-60"
        >
          Yakunlash
        </button>
        <button
          disabled={isPending}
          onClick={() => apply("NO_SHOW")}
          className="flex-1 rounded-md border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
        >
          Kelmadi
        </button>
      </div>
    );
  }

  return null;
}
