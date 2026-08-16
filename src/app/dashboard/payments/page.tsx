// OWNER: Backend-2 (baza tayyor — kengaytiring)
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { EmptyState } from "@/components/layout/empty-state";
import { PaymentForm } from "@/components/dashboard/payment-form";
import { requireCurrentMembership } from "@/lib/permissions/get-current-membership";
import { listPayments } from "@/lib/actions/payments";
import { listBookings } from "@/lib/actions/bookings";
import { CreditCard } from "lucide-react";
import { format } from "date-fns";

export default async function PaymentsPage() {
  const membership = await requireCurrentMembership();
  const [payments, bookings] = await Promise.all([
    listPayments(membership.businessId),
    listBookings(membership.businessId),
  ]);
  const unpaidBookings = bookings.filter((b) => b.payment_status === "UNPAID" || b.payment_status === "PARTIAL");

  return (
    <div>
      <PageHeader title="To'lovlar" description="Qabul qilingan to'lovlar tarixi." />
      <PaymentForm unpaidBookings={unpaidBookings} />
      {payments.length === 0 ? (
        <EmptyState title="Hali to'lov yo'q" icon={CreditCard} />
      ) : (
        <DataTable
          rows={payments}
          columns={[
            { header: "Sana", cell: (p) => format(new Date(p.created_at), "dd.MM HH:mm") },
            { header: "Mijoz", cell: (p) => p.booking?.customer?.full_name ?? "—" },
            { header: "Summa", cell: (p) => `${p.amount.toLocaleString("uz-UZ")} so'm` },
            { header: "Usul", cell: (p) => (p.method === "CASH" ? "Naqd" : "Karta") },
          ]}
        />
      )}
    </div>
  );
}
