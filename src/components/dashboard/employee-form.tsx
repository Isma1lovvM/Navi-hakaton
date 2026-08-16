"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { employeeInviteSchema, type EmployeeInviteInput } from "@/lib/validation/employee";
import { createEmployee } from "@/lib/actions/employees";

export function EmployeeForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeInviteInput>({ resolver: zodResolver(employeeInviteSchema) });

  const onSubmit = (values: EmployeeInviteInput) => {
    startTransition(async () => {
      const result = await createEmployee(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Xodim qo'shildi");
      reset();
      setOpen(false);
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md bg-accent-600 px-3 py-2 text-sm font-medium text-white hover:bg-accent-700"
      >
        <Plus className="h-4 w-4" /> Xodim qo&apos;shish
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-6 space-y-3 rounded-card border border-border bg-surface p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Ism</label>
          <input {...register("full_name")} className="w-full rounded-md border border-border px-3 py-2 text-sm" />
          {errors.full_name ? <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input {...register("email")} className="w-full rounded-md border border-border px-3 py-2 text-sm" />
          {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Telefon</label>
          <input {...register("phone")} className="w-full rounded-md border border-border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Usta nomi (resurs)</label>
          <input {...register("resource_name")} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder="masalan: Javohir" />
          {errors.resource_name ? <p className="mt-1 text-xs text-red-600">{errors.resource_name.message}</p> : null}
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-60">
          {isPending ? "Saqlanmoqda..." : "Saqlash"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-slate-600">
          Bekor qilish
        </button>
      </div>
    </form>
  );
}
