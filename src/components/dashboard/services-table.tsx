"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Check, X, Ban, RotateCcw } from "lucide-react";
import { DataTable } from "@/components/dashboard/data-table";
import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import { serviceSchema } from "@/lib/validation/service";
import { updateService, toggleServiceActive } from "@/lib/actions/services";
import type { Service } from "@/types/database";

interface Draft {
  name: string;
  duration_minutes: string;
  price: string;
}

const editSchema = serviceSchema.pick({ name: true, duration_minutes: true, price: true });

export function ServicesTable({ services, canManage }: { services: Service[]; canManage: boolean }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({ name: "", duration_minutes: "", price: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmTarget, setConfirmTarget] = useState<Service | null>(null);
  const [isSavePending, startSaveTransition] = useTransition();
  const [isTogglePending, startToggleTransition] = useTransition();

  const startEdit = (service: Service) => {
    setEditingId(service.id);
    setDraft({
      name: service.name,
      duration_minutes: String(service.duration_minutes),
      price: String(service.price),
    });
    setFieldErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFieldErrors({});
  };

  const save = (service: Service) => {
    const parsed = editSchema.safeParse({
      name: draft.name,
      duration_minutes: draft.duration_minutes,
      price: draft.price,
    });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    startSaveTransition(async () => {
      const result = await updateService(service.id, parsed.data);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Xizmat yangilandi");
      setEditingId(null);
    });
  };

  const toggleActive = (service: Service) => {
    startToggleTransition(async () => {
      const result = await toggleServiceActive(service.id, !service.is_active);
      if (result.error) toast.error(result.error);
      else toast.success(service.is_active ? "Xizmat nofaol qilindi" : "Xizmat faollashtirildi");
      setConfirmTarget(null);
    });
  };

  return (
    <>
      <DataTable
        rows={services}
        columns={[
          {
            header: "Nomi",
            cell: (s) =>
              editingId === s.id ? (
                <div>
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    className="w-full min-w-32 rounded-md border border-border px-2 py-1 text-sm"
                  />
                  {fieldErrors.name ? <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p> : null}
                </div>
              ) : (
                <span className="font-medium text-slate-900">{s.name}</span>
              ),
          },
          {
            header: "Davomiyligi",
            cell: (s) =>
              editingId === s.id ? (
                <div>
                  <input
                    type="number"
                    value={draft.duration_minutes}
                    onChange={(e) => setDraft((d) => ({ ...d, duration_minutes: e.target.value }))}
                    className="w-20 rounded-md border border-border px-2 py-1 text-sm"
                  />
                  {fieldErrors.duration_minutes ? (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.duration_minutes}</p>
                  ) : null}
                </div>
              ) : (
                `${s.duration_minutes} daqiqa`
              ),
          },
          {
            header: "Narxi",
            cell: (s) =>
              editingId === s.id ? (
                <div>
                  <input
                    type="number"
                    value={draft.price}
                    onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                    className="w-24 rounded-md border border-border px-2 py-1 text-sm"
                  />
                  {fieldErrors.price ? <p className="mt-1 text-xs text-red-600">{fieldErrors.price}</p> : null}
                </div>
              ) : (
                `${s.price.toLocaleString("uz-UZ")} so'm`
              ),
          },
          {
            header: "Holati",
            cell: (s) => (
              <span className={s.is_active ? "text-emerald-600" : "text-slate-400"}>
                {s.is_active ? "Faol" : "Nofaol"}
              </span>
            ),
          },
          ...(canManage
            ? [
                {
                  header: "Amallar",
                  cell: (s: Service) =>
                    editingId === s.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => save(s)}
                          disabled={isSavePending}
                          className="rounded-md bg-accent-600 px-2 py-1 text-xs font-medium text-white hover:bg-accent-700 disabled:opacity-60"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="rounded-md border border-border px-2 py-1 text-xs font-medium text-slate-600 hover:bg-surface-muted"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(s)}
                          className="rounded-md border border-border px-2 py-1 text-xs font-medium text-slate-600 hover:bg-surface-muted"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmTarget(s)}
                          className="rounded-md border border-border px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          {s.is_active ? <Ban className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    ),
                },
              ]
            : []),
        ]}
      />

      <ConfirmDialog
        open={!!confirmTarget}
        title={confirmTarget?.is_active ? "Xizmatni nofaol qilish" : "Xizmatni qayta faollashtirish"}
        description={
          confirmTarget
            ? confirmTarget.is_active
              ? `"${confirmTarget.name}" endi mijozlarga ko'rinmaydi va band qilib bo'lmaydi, lekin tarixi saqlanadi.`
              : `"${confirmTarget.name}" mijozlarga yana ko'rinadi.`
            : undefined
        }
        confirmLabel={confirmTarget?.is_active ? "Nofaol qilish" : "Faollashtirish"}
        destructive={confirmTarget?.is_active}
        onConfirm={() => confirmTarget && toggleActive(confirmTarget)}
        onCancel={() => setConfirmTarget(null)}
      />

      {isTogglePending ? <p className="mt-2 text-xs text-slate-400">Saqlanmoqda...</p> : null}
    </>
  );
}
