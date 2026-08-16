// OWNER: Backend-1 (baza tayyor — tahrirlash/o'chirish UI'ni kengaytiring)
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { EmptyState } from "@/components/layout/empty-state";
import { ServiceForm } from "@/components/dashboard/service-form";
import { requireCurrentMembership } from "@/lib/permissions/get-current-membership";
import { listServices } from "@/lib/actions/services";
import { Scissors } from "lucide-react";

export default async function ServicesPage() {
  const membership = await requireCurrentMembership();
  const services = await listServices(membership.businessId);

  return (
    <div>
      <PageHeader title="Xizmatlar" description="Narxlar va davomiylik." action={<ServiceForm />} />
      {services.length === 0 ? (
        <EmptyState title="Hali xizmat qo'shilmagan" icon={Scissors} />
      ) : (
        <DataTable
          rows={services}
          columns={[
            { header: "Nomi", cell: (s) => <span className="font-medium text-slate-900">{s.name}</span> },
            { header: "Davomiyligi", cell: (s) => `${s.duration_minutes} daqiqa` },
            { header: "Narxi", cell: (s) => `${s.price.toLocaleString("uz-UZ")} so'm` },
            {
              header: "Holati",
              cell: (s) => (
                <span className={s.is_active ? "text-emerald-600" : "text-slate-400"}>
                  {s.is_active ? "Faol" : "Nofaol"}
                </span>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
