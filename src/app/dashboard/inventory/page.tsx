// OWNER: Backend-2 (baza tayyor — kengaytiring)
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { EmptyState } from "@/components/layout/empty-state";
import { AddProductForm, QuickAdjust } from "@/components/dashboard/inventory-form";
import { requireCurrentMembership } from "@/lib/permissions/get-current-membership";
import { listProducts } from "@/lib/actions/inventory";
import { AlertTriangle, Package } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default async function InventoryPage() {
  const membership = await requireCurrentMembership();
  const products = await listProducts(membership.businessId);

  return (
    <div>
      <PageHeader title="Ombor" description="Mahsulot zaxiralari." action={<AddProductForm />} />
      {products.length === 0 ? (
        <EmptyState title="Hali mahsulot yo'q" icon={Package} />
      ) : (
        <DataTable
          rows={products}
          columns={[
            { header: "Nomi", cell: (p) => <span className="font-medium text-slate-900">{p.name}</span> },
            { header: "Miqdor", cell: (p) => `${p.quantity} ${p.unit}` },
            {
              header: "Holat",
              cell: (p) => (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-sm font-medium",
                    p.quantity <= p.min_quantity ? "text-amber-700" : "text-emerald-600"
                  )}
                >
                  {p.quantity <= p.min_quantity ? <AlertTriangle className="h-3.5 w-3.5" /> : null}
                  {p.quantity <= p.min_quantity ? "Kam qoldi" : "Yetarli"}
                </span>
              ),
            },
            { header: "", cell: (p) => <QuickAdjust productId={p.id} /> },
          ]}
        />
      )}
    </div>
  );
}
