// OWNER: Backend-1 (kengaytirildi — tahrirlash/nofaol qilish UI'i va resource_hours tahrirlash)
import { PageHeader } from "@/components/layout/page-header";
import { EmployeeManageCard } from "@/components/dashboard/employee-manage-card";
import { EmptyState } from "@/components/layout/empty-state";
import { EmployeeForm } from "@/components/dashboard/employee-form";
import { requireCurrentMembership } from "@/lib/permissions/get-current-membership";
import { canManageEmployeesAndServices } from "@/lib/permissions/roles";
import { listEmployees, listResourceHoursForResources } from "@/lib/actions/employees";
import { Users } from "lucide-react";

export default async function EmployeesPage() {
  const membership = await requireCurrentMembership();
  const canManage = canManageEmployeesAndServices(membership);
  const employees = await listEmployees(membership.businessId);
  const resourceIds = employees.map((emp) => emp.resource?.id).filter((id): id is string => Boolean(id));
  const hoursByResource = await listResourceHoursForResources(resourceIds);

  return (
    <div>
      <PageHeader
        title="Xodimlar"
        description="Sartaroshxonangizdagi ustalar."
        action={canManage ? <EmployeeForm /> : undefined}
      />
      {employees.length === 0 ? (
        <EmptyState title="Hali xodim qo'shilmagan" icon={Users} />
      ) : (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {employees.map((emp) =>
            emp.resource ? (
              <EmployeeManageCard
                key={emp.id}
                employee={emp}
                hours={hoursByResource[emp.resource.id] ?? []}
                canManage={canManage}
              />
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
