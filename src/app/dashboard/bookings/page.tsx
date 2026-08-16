// OWNER: Backend-2 (baza tayyor — filter/pagination kengaytirilishi mumkin)
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { BookingStatusBadge } from "@/components/booking/booking-status-badge";
import { BookingStatusActions } from "@/components/booking/booking-status-actions";
import { EmptyState } from "@/components/layout/empty-state";
import { requireCurrentMembership } from "@/lib/permissions/get-current-membership";
import { listBookings } from "@/lib/actions/bookings";
import { ALLOWED_STATUS_TRANSITIONS } from "@/lib/validation/booking";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";

export default async function BookingsPage() {
  const membership = await requireCurrentMembership();
  const bookings = await listBookings(membership.businessId);

  return (
    <div>
      <PageHeader title="Bookinglar" description="Barcha bronlar va ularning holati." />
      {bookings.length === 0 ? (
        <EmptyState title="Hali booking yo'q" icon={CalendarDays} />
      ) : (
        <DataTable
          rows={bookings}
          columns={[
            { header: "Sana/vaqt", cell: (b) => format(new Date(b.start_at), "dd.MM HH:mm") },
            { header: "Mijoz", cell: (b) => b.customer.full_name },
            { header: "Usta", cell: (b) => b.resource.name },
            { header: "Xizmat", cell: (b) => b.service.name },
            { header: "Holat", cell: (b) => <BookingStatusBadge status={b.status} /> },
            {
              header: "Amallar",
              cell: (b) => (
                <BookingStatusActions bookingId={b.id} allowedNext={(ALLOWED_STATUS_TRANSITIONS[b.status] ?? []) as never} />
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
