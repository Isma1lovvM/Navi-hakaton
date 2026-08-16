import type { BookingStatus } from "@/types/database";
import { cn } from "@/lib/utils/cn";

const LABELS: Record<BookingStatus, string> = {
  PENDING: "Kutilmoqda",
  CONFIRMED: "Tasdiqlangan",
  IN_PROGRESS: "Jarayonda",
  COMPLETED: "Yakunlangan",
  CANCELLED: "Bekor qilingan",
  NO_SHOW: "Kelmadi",
};

const CLASS: Record<BookingStatus, string> = {
  PENDING: "status-pending",
  CONFIRMED: "status-confirmed",
  IN_PROGRESS: "status-in-progress",
  COMPLETED: "status-completed",
  CANCELLED: "status-cancelled",
  NO_SHOW: "status-no-show",
};

export function BookingStatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        CLASS[status],
        className
      )}
    >
      {LABELS[status]}
    </span>
  );
}
