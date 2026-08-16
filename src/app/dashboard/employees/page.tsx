// OWNER: Backend-1
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { EmployeeForm } from "@/components/dashboard/employee-form";
import { EmployeeHoursPanel } from "@/components/dashboard/employee-hours-panel";
import { requireCurrentMembership } from "@/lib/permissions/get-current-membership";
import { listEmployees, getResourceHours } from "@/lib/actions/employees";
import { Users } from "lucide-react";

export default async function EmployeesPage() {
  const membership = await requireCurrentMembership();
  const employees = await listEmployees(membership.businessId);
  const withResource = employees.filter((emp) => emp.resource);
  const hoursByResource = await Promise.all(
    withResource.map((emp) => getResourceHours(emp.resource!.id))
  );

  return (
    <div>
      <PageHeader title="Xodimlar" description="Sartaroshxonangizdagi ustalar." action={<EmployeeForm />} />
      {employees.length === 0 ? (
        <EmptyState title="Hali xodim qo'shilmagan" icon={Users} />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {withResource.map((emp, i) => (
            <EmployeeHoursPanel key={emp.id} memberId={emp.id} resource={emp.resource!} hours={hoursByResource[i] ?? []} />
          ))}
        </div>
      )}
    </div>
  );
}
