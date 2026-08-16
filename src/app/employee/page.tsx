// OWNER: Frontend-1 (baza tayyor — profil bo'limi P1)
import { PageHeader } from "@/components/layout/page-header";
import { BookingStatusBadge } from "@/components/booking/booking-status-badge";
import { EmployeeQueueActions } from "@/components/booking/employee-queue-actions";
import { EmptyState } from "@/components/layout/empty-state";
import { requireCurrentMembership } from "@/lib/permissions/get-current-membership";
import { getEmployeeQueue } from "@/lib/actions/bookings";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";

export default async function EmployeeSchedulePage() {
  const membership = await requireCurrentMembership();

  if (!membership.resourceId) {
    return (
      <div className="mx-auto max-w-md p-4">
        <PageHeader title="Mening jadvalim" />
        <p className="text-sm text-slate-500">Sizga hali resurs (usta identifikatori) biriktirilmagan.</p>
      </div>
    );
  }

  const queue = await getEmployeeQueue(membership.resourceId);
  const [next, ...rest] = queue;

  return (
    <div className="mx-auto max-w-md p-4">
      <PageHeader title="Mening jadvalim" />

      {!next ? (
        <EmptyState title="Bugun navbat yo'q" description="Hozircha mijoz kutilmayapti." icon={CalendarDays} />
      ) : (
        <div className="rounded-card border border-border bg-surface p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Keyingi mijoz</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{next.customer.full_name}</p>
          <p className="mt-1 text-sm text-slate-500">
            {format(new Date(next.start_at), "HH:mm")} · {next.service.name} · {next.service.price.toLocaleString("uz-UZ")} so&apos;m
          </p>
          <div className="mt-4">
            <EmployeeQueueActions bookingId={next.id} status={next.status} />
          </div>
        </div>
      )}

      {rest.length > 0 ? (
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Navbatdagilar</h2>
          <div className="space-y-2">
            {rest.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-card border border-border bg-surface p-3 text-sm">
                <span>
                  {format(new Date(b.start_at), "HH:mm")} — {b.customer.full_name}
                </span>
                <BookingStatusBadge status={b.status} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
