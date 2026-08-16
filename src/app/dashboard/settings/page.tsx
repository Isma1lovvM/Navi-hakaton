// OWNER: Backend-1 (baza tayyor — biznes profili formasini kengaytiring)
import { PageHeader } from "@/components/layout/page-header";
import { BusinessHoursForm } from "@/components/dashboard/business-hours-form";
import { requireCurrentMembership } from "@/lib/permissions/get-current-membership";
import { getBusinessHours, getMyBusiness } from "@/lib/actions/business";

export default async function SettingsPage() {
  const membership = await requireCurrentMembership();
  const [business, hours] = await Promise.all([
    getMyBusiness(),
    getBusinessHours(membership.businessId),
  ]);

  return (
    <div>
      <PageHeader title="Sozlamalar" description="Biznes ma'lumotlari va ish vaqtlari." />

      {business ? (
        <div className="mb-6 rounded-card border border-border bg-surface p-4">
          <p className="text-sm text-slate-500">Biznes nomi</p>
          <p className="text-lg font-semibold text-slate-900">{business.name}</p>
          <p className="mt-2 text-sm text-slate-500">{business.address}</p>
        </div>
      ) : null}

      <h2 className="mb-3 text-sm font-semibold text-slate-700">Ish vaqtlari</h2>
      <BusinessHoursForm hours={hours} />
    </div>
  );
}
