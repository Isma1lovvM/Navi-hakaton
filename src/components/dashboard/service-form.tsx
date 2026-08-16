"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { serviceSchema, type ServiceInput } from "@/lib/validation/service";
import { createService } from "@/lib/actions/services";
import type { z } from "zod";

export function ServiceForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof serviceSchema>, unknown, ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { is_active: true },
  });

  const onSubmit = (values: ServiceInput) => {
    startTransition(async () => {
      const result = await createService(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Xizmat qo'shildi");
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
        <Plus className="h-4 w-4" /> Xizmat qo&apos;shish
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-6 space-y-3 rounded-card border border-border bg-surface p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nomi</label>
          <input {...register("name")} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder="Soch olish" />
          {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name.message}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Davomiyligi (daqiqa)</label>
          <input type="number" {...register("duration_minutes")} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder="30" />
          {errors.duration_minutes ? <p className="mt-1 text-xs text-red-600">{errors.duration_minutes.message}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Narxi (so&apos;m)</label>
          <input type="number" {...register("price")} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder="40000" />
          {errors.price ? <p className="mt-1 text-xs text-red-600">{errors.price.message}</p> : null}
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
