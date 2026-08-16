// OWNER: Backend-1 (baza tayyor — resource_hours tahrirlashni kengaytiring)
import { PageHeader } from "@/components/layout/page-header";
import { EmployeeCard } from "@/components/dashboard/employee-card";
import { EmptyState } from "@/components/layout/empty-state";
import { EmployeeForm } from "@/components/dashboard/employee-form";
import { requireCurrentMembership } from "@/lib/permissions/get-current-membership";
import { listEmployees } from "@/lib/actions/employees";
import { Users } from "lucide-react";

export default async function EmployeesPage() {
  const membership = await requireCurrentMembership();
  const employees = await listEmployees(membership.businessId);

  return (
    <div>
      <PageHeader title="Xodimlar" description="Sartaroshxonangizdagi ustalar." action={<EmployeeForm />} />
      {employees.length === 0 ? (
        <EmptyState title="Hali xodim qo'shilmagan" icon={Users} />
      ) : (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {employees.map((emp) =>
            emp.resource ? (
              <EmployeeCard key={emp.id} resource={emp.resource as never} statusLabel={emp.resource.is_active ? "Available" : "Off today"} />
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
