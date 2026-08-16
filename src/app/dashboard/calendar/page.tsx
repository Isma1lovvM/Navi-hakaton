// OWNER: Frontend-1 (baza tayyor — sana tanlashni kengaytiring, hozircha bugun)
import { PageHeader } from "@/components/layout/page-header";
import { BookingCard } from "@/components/booking/booking-card";
import { EmptyState } from "@/components/layout/empty-state";
import { requireCurrentMembership } from "@/lib/permissions/get-current-membership";
import { listEmployees } from "@/lib/actions/employees";
import { getTodaySchedule } from "@/lib/actions/bookings";
import { CalendarDays } from "lucide-react";

export default async function CalendarPage() {
  const membership = await requireCurrentMembership();
  const [employees, schedule] = await Promise.all([
    listEmployees(membership.businessId),
    getTodaySchedule(membership.businessId),
  ]);

  return (
    <div>
      <PageHeader title="Kalendar" description="Bugungi kun, ustalar bo'yicha." />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {employees.map((emp) => {
          if (!emp.resource) return null;
          const items = schedule.filter((b) => b.resource_id === emp.resource!.id);
          return (
            <div key={emp.id}>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">{emp.resource.name}</h3>
              {items.length === 0 ? (
                <EmptyState title="Bugun bron yo'q" icon={CalendarDays} />
              ) : (
                <div className="space-y-2">
                  {items.map((b) => (
                    <BookingCard key={b.id} booking={b} compact />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
