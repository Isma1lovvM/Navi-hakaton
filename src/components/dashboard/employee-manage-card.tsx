"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil, Clock, Ban, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { employeeEditSchema, type EmployeeEditInput } from "@/lib/validation/employee";
import { updateEmployee, setEmployeeActive } from "@/lib/actions/employees";
import type { EmployeeWithResource } from "@/lib/actions/employees";
import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import { ResourceHoursForm } from "@/components/dashboard/resource-hours-form";
import type { ResourceHours } from "@/types/database";

type Mode = "view" | "edit" | "hours";

export function EmployeeManageCard({
  employee,
  hours,
  canManage,
}: {
  employee: EmployeeWithResource;
  hours: ResourceHours[];
  canManage: boolean;
}) {
  const resource = employee.resource;
  const [mode, setMode] = useState<Mode>("view");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isTogglePending, startToggleTransition] = useTransition();
  const [isSavePending, startSaveTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeEditInput>({
    resolver: zodResolver(employeeEditSchema),
    defaultValues: {
      full_name: employee.profile?.full_name ?? "",
      phone: employee.profile?.phone ?? undefined,
      resource_name: resource?.name ?? "",
    },
  });

  if (!resource) return null;

  const onSubmit = (values: EmployeeEditInput) => {
    startSaveTransition(async () => {
      const result = await updateEmployee(employee.id, values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Xodim ma'lumotlari yangilandi");
      setMode("view");
    });
  };

  const onToggleActive = () => {
    startToggleTransition(async () => {
      const result = await setEmployeeActive(employee.id, !resource.is_active);
      if (result.error) toast.error(result.error);
      else toast.success(resource.is_active ? "Xodim nofaol qilindi" : "Xodim qayta faollashtirildi");
      setConfirmOpen(false);
    });
  };

  return (
    <div
      className={cn(
        "rounded-card border p-3",
        resource.is_active ? "border-border bg-surface" : "border-border bg-surface-muted"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={cn(!resource.is_active && "opacity-60")}>
          <p className="font-medium text-slate-900">{resource.name}</p>
          <p className="text-xs text-slate-500">{employee.profile?.full_name}</p>
          <p className="text-xs text-slate-400">{employee.profile?.phone ?? "Telefon kiritilmagan"}</p>
        </div>
        <span className={cn("shrink-0 text-xs font-medium", resource.is_active ? "text-emerald-600" : "text-slate-400")}>
          {resource.is_active ? "Faol" : "Nofaol"}
        </span>
      </div>

      {canManage ? (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setMode(mode === "edit" ? "view" : "edit")}
            className={cn(
              "flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-surface-muted",
              mode === "edit" ? "border-accent-600 text-accent-700" : "border-border text-slate-600"
            )}
          >
            <Pencil className="h-3.5 w-3.5" /> Tahrirlash
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "hours" ? "view" : "hours")}
            className={cn(
              "flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-surface-muted",
              mode === "hours" ? "border-accent-600 text-accent-700" : "border-border text-slate-600"
            )}
          >
            <Clock className="h-3.5 w-3.5" /> Ish vaqtlari
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="ml-auto flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            {resource.is_active ? (
              <>
                <Ban className="h-3.5 w-3.5" /> Nofaol qilish
              </>
            ) : (
              <>
                <RotateCcw className="h-3.5 w-3.5" /> Faollashtirish
              </>
            )}
          </button>
        </div>
      ) : null}

      {mode === "edit" ? (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-3 space-y-2 border-t border-border pt-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Ism</label>
            <input {...register("full_name")} className="w-full rounded-md border border-border px-2 py-1.5 text-sm" />
            {errors.full_name ? <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Telefon</label>
            <input {...register("phone")} className="w-full rounded-md border border-border px-2 py-1.5 text-sm" />
            {errors.phone ? <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Usta nomi (resurs)</label>
            <input {...register("resource_name")} className="w-full rounded-md border border-border px-2 py-1.5 text-sm" />
            {errors.resource_name ? <p className="mt-1 text-xs text-red-600">{errors.resource_name.message}</p> : null}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSavePending}
              className="rounded-md bg-accent-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-700 disabled:opacity-60"
            >
              {isSavePending ? "Saqlanmoqda..." : "Saqlash"}
            </button>
            <button
              type="button"
              onClick={() => setMode("view")}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-slate-600"
            >
              Bekor qilish
            </button>
          </div>
        </form>
      ) : null}

      {mode === "hours" ? (
        <div className="mt-3 border-t border-border pt-3">
          <ResourceHoursForm resourceId={resource.id} hours={hours} />
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        title={resource.is_active ? "Xodimni nofaol qilish" : "Xodimni qayta faollashtirish"}
        description={
          resource.is_active
            ? `"${resource.name}" endi navbatga qo'yilmaydi, lekin tarixi (o'tgan bookinglari) saqlanadi.`
            : `"${resource.name}" yana navbatga qo'yiladi va dashboard'ga kira oladi.`
        }
        confirmLabel={resource.is_active ? "Nofaol qilish" : "Faollashtirish"}
        destructive={resource.is_active}
        onConfirm={onToggleActive}
        onCancel={() => setConfirmOpen(false)}
      />

      {isTogglePending ? <p className="mt-2 text-xs text-slate-400">Saqlanmoqda...</p> : null}
    </div>
  );
}
