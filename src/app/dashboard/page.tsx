// OWNER: Frontend-1 (baza tayyor — kerak bo'lsa kengaytiring/sayqallang)
// Answers "Bugun menda nima bor?" (spec section 16).

import { CalendarDays, CreditCard, AlertTriangle, Users, Package } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { BookingCard } from "@/components/booking/booking-card";
import { EmployeeCard } from "@/components/dashboard/employee-card";
import { EmptyState } from "@/components/layout/empty-state";
import { requireCurrentMembership } from "@/lib/permissions/get-current-membership";
import { getDailyReport } from "@/lib/actions/reports";
import { getTodaySchedule } from "@/lib/actions/bookings";
import { listEmployees } from "@/lib/actions/employees";
import { listProducts } from "@/lib/actions/inventory";

export default async function DashboardOverviewPage() {
  const membership = await requireCurrentMembership();

  const [report, schedule, employees, products] = await Promise.all([
    getDailyReport(membership.businessId),
    getTodaySchedule(membership.businessId),
    listEmployees(membership.businessId),
    listProducts(membership.businessId),
  ]);

  const lowStock = products.filter((p) => p.quantity <= p.min_quantity);

  return (
    <div>
      <PageHeader title="Bugungi holat" description="Bugun biznesda nima bo'layotgani." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Bugungi daromad" value={`${report.revenue.toLocaleString("uz-UZ")} so'm`} icon={CreditCard} tone="success" />
        <StatCard label="Mijozlar" value={report.uniqueCustomers} icon={Users} />
        <StatCard label="Bookinglar" value={report.bookingsCount} icon={CalendarDays} />
        <StatCard label="Kelmaganlar" value={report.noShow} icon={AlertTriangle} tone={report.noShow > 0 ? "warning" : "default"} />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Bugungi jadval</h2>
        {schedule.length === 0 ? (
          <EmptyState title="Bugun bron yo'q" description="Jadvalingiz bo'sh." icon={CalendarDays} />
        ) : (
          <div className="space-y-2">
            {schedule.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Xodimlar holati</h2>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {employees.map((emp) =>
            emp.resource ? (
              <EmployeeCard
                key={emp.id}
                resource={emp.resource as never}
                statusLabel={
                  schedule.some((b) => b.resource_id === emp.resource!.id && b.status === "IN_PROGRESS")
                    ? "With customer"
                    : "Available"
                }
              />
            ) : null
          )}
        </div>
      </div>

      {products.length > 0 ? (
        <div className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Package className="h-4 w-4" /> Kam qolgan mahsulotlar
          </h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-slate-400">Hammasi yetarli miqdorda.</p>
          ) : (
            <div className="space-y-2">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-card border border-amber-200 bg-amber-50 px-4 py-2 text-sm">
                  <span className="font-medium text-amber-900">{p.name}</span>
                  <span className="text-amber-700">
                    {p.quantity} {p.unit} qoldi
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
