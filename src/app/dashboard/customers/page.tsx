// OWNER: Backend-2 (P1 — baza tayyor, to'liq tarix sahifasi keyingi qadam)
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { EmptyState } from "@/components/layout/empty-state";
import { requireCurrentMembership } from "@/lib/permissions/get-current-membership";
import { listCustomers } from "@/lib/actions/customers";
import { UserRound } from "lucide-react";

export default async function CustomersPage() {
  const membership = await requireCurrentMembership();
  const customers = await listCustomers(membership.businessId);

  return (
    <div>
      <PageHeader title="Mijozlar" description="Barcha mijozlar ro'yxati." />
      {customers.length === 0 ? (
        <EmptyState title="Hali mijoz yo'q" icon={UserRound} />
      ) : (
        <DataTable
          rows={customers}
          columns={[
            { header: "Ism", cell: (c) => <span className="font-medium text-slate-900">{c.full_name}</span> },
            { header: "Telefon", cell: (c) => c.phone },
            { header: "Bookinglar soni", cell: (c) => c.bookingsCount },
          ]}
        />
      )}
    </div>
  );
}
