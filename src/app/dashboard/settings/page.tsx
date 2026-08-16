// OWNER: Backend-1 (kengaytirildi — biznes profili tahrirlash formasi qo'shildi)
import { PageHeader } from "@/components/layout/page-header";
import { BusinessHoursForm } from "@/components/dashboard/business-hours-form";
import { BusinessProfileForm } from "@/components/dashboard/business-profile-form";
import { requireCurrentMembership } from "@/lib/permissions/get-current-membership";
import { canManageBusinessSettings } from "@/lib/permissions/roles";
import { getBusinessHours, getMyBusiness } from "@/lib/actions/business";

export default async function SettingsPage() {
  const membership = await requireCurrentMembership();
  const canManage = canManageBusinessSettings(membership);
  const [business, hours] = await Promise.all([
    getMyBusiness(),
    getBusinessHours(membership.businessId),
  ]);

  return (
    <div>
      <PageHeader title="Sozlamalar" description="Biznes ma'lumotlari va ish vaqtlari." />

      {business ? <BusinessProfileForm business={business} canManage={canManage} /> : null}

      <h2 className="mb-3 text-sm font-semibold text-slate-700">Ish vaqtlari</h2>
      {canManage ? (
        <BusinessHoursForm hours={hours} />
      ) : (
        <p className="text-sm text-slate-400">Ish vaqtlarini faqat biznes egasi o'zgartira oladi.</p>
      )}
    </div>
  );
}
