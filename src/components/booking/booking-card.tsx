import { format } from "date-fns";
import { BookingStatusBadge } from "@/components/booking/booking-status-badge";
import type { BookingCardProps } from "@/components/types";

export function BookingCard({ booking, compact }: BookingCardProps) {
  return (
    <div className="flex items-center justify-between rounded-card border border-border bg-surface p-3">
      <div className="flex items-center gap-3">
        <span className="w-14 shrink-0 text-sm font-medium text-slate-500">
          {format(new Date(booking.start_at), "HH:mm")}
        </span>
        <div>
          <p className="font-medium text-slate-900">{booking.customer.full_name}</p>
          {!compact ? (
            <p className="text-sm text-slate-500">
              {booking.service.name} · {booking.resource.name}
            </p>
          ) : null}
        </div>
      </div>
      <BookingStatusBadge status={booking.status} />
    </div>
  );
}
