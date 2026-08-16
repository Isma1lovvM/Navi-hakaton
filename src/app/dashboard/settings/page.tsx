// OWNER: Backend-1
import { PageHeader } from "@/components/layout/page-header";
import { BusinessHoursForm } from "@/components/dashboard/business-hours-form";
import { BusinessProfileForm } from "@/components/dashboard/business-profile-form";
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

      {business ? <BusinessProfileForm business={business} /> : null}

      <h2 className="mb-3 text-sm font-semibold text-slate-700">Ish vaqtlari</h2>
      <BusinessHoursForm hours={hours} />
    </div>
  );
}
