"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateBookingStatus } from "@/lib/actions/bookings";
import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import type { BookingStatus } from "@/types/database";

const LABELS: Record<string, string> = {
  IN_PROGRESS: "Boshlash",
  COMPLETED: "Yakunlash",
  CANCELLED: "Bekor qilish",
  NO_SHOW: "Kelmadi",
  CONFIRMED: "Tasdiqlash",
};

export function BookingStatusActions({
  bookingId,
  allowedNext,
}: {
  bookingId: string;
  allowedNext: BookingStatus[];
}) {
  const [isPending, startTransition] = useTransition();
  const [pendingStatus, setPendingStatus] = useState<BookingStatus | null>(null);

  const apply = (status: BookingStatus) => {
    startTransition(async () => {
      const result = await updateBookingStatus({ booking_id: bookingId, status });
      if (result.error) toast.error(result.error);
      else toast.success("Holat yangilandi");
      setPendingStatus(null);
    });
  };

  const destructive = pendingStatus === "CANCELLED" || pendingStatus === "NO_SHOW";

  return (
    <div className="flex flex-wrap gap-1.5">
      {allowedNext.map((status) => (
        <button
          key={status}
          disabled={isPending}
          onClick={() =>
            status === "CANCELLED" || status === "NO_SHOW" ? setPendingStatus(status) : apply(status)
          }
          className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-accent-500 hover:text-accent-700 disabled:opacity-60"
        >
          {LABELS[status] ?? status}
        </button>
      ))}
      <ConfirmDialog
        open={pendingStatus !== null}
        title={pendingStatus === "NO_SHOW" ? "Mijoz kelmadi deb belgilaysizmi?" : "Bookingni bekor qilasizmi?"}
        description="Bu amalni qaytarib bo'lmaydi."
        destructive={destructive}
        confirmLabel="Ha, tasdiqlayman"
        onConfirm={() => pendingStatus && apply(pendingStatus)}
        onCancel={() => setPendingStatus(null)}
      />
    </div>
  );
}
