// OWNER: Backend-2 (baza tayyor — kengaytiring)
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { WeeklyRevenueChart } from "@/components/dashboard/weekly-revenue-chart";
import { requireCurrentMembership } from "@/lib/permissions/get-current-membership";
import { getDailyReport, getWeeklyRevenue } from "@/lib/actions/reports";
import { CreditCard, CalendarDays, CheckCircle2, XCircle } from "lucide-react";

export default async function ReportsPage() {
  const membership = await requireCurrentMembership();
  const [daily, weekly] = await Promise.all([
    getDailyReport(membership.businessId),
    getWeeklyRevenue(membership.businessId),
  ]);

  return (
    <div>
      <PageHeader title="Hisobotlar" description="Kunlik va haftalik ko'rsatkichlar." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Bugungi daromad" value={`${daily.revenue.toLocaleString("uz-UZ")} so'm`} icon={CreditCard} tone="success" />
        <StatCard label="Bookinglar" value={daily.bookingsCount} icon={CalendarDays} />
        <StatCard label="Yakunlangan" value={daily.completed} icon={CheckCircle2} tone="success" />
        <StatCard label="Bekor/Kelmadi" value={daily.cancelled + daily.noShow} icon={XCircle} tone={daily.cancelled + daily.noShow > 0 ? "warning" : "default"} />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Haftalik daromad</h2>
        <WeeklyRevenueChart data={weekly} />
      </div>
    </div>
  );
}
