// OWNER: Backend-1 (kengaytirildi — tahrirlash/nofaol qilish UI'i qo'shildi)
import { PageHeader } from "@/components/layout/page-header";
import { ServicesTable } from "@/components/dashboard/services-table";
import { EmptyState } from "@/components/layout/empty-state";
import { ServiceForm } from "@/components/dashboard/service-form";
import { requireCurrentMembership } from "@/lib/permissions/get-current-membership";
import { canManageEmployeesAndServices } from "@/lib/permissions/roles";
import { listServices } from "@/lib/actions/services";
import { Scissors } from "lucide-react";

export default async function ServicesPage() {
  const membership = await requireCurrentMembership();
  const canManage = canManageEmployeesAndServices(membership);
  const services = await listServices(membership.businessId);

  return (
    <div>
      <PageHeader
        title="Xizmatlar"
        description="Narxlar va davomiylik."
        action={canManage ? <ServiceForm /> : undefined}
      />
      {services.length === 0 ? (
        <EmptyState title="Hali xizmat qo'shilmagan" icon={Scissors} />
      ) : (
        <ServicesTable services={services} canManage={canManage} />
      )}
    </div>
  );
}
