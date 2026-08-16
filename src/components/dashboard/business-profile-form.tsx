"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { businessProfileSchema, type BusinessProfileInput } from "@/lib/validation/business";
import { updateBusinessProfile } from "@/lib/actions/business";
import type { Business } from "@/types/database";

export function BusinessProfileForm({ business, canManage }: { business: Business; canManage: boolean }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessProfileInput>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      name: business.name,
      address: business.address ?? undefined,
      phone: business.phone ?? undefined,
    },
  });

  const onSubmit = (values: BusinessProfileInput) => {
    startTransition(async () => {
      const result = await updateBusinessProfile(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Biznes ma'lumotlari yangilandi");
      setEditing(false);
    });
  };

  if (!editing) {
    return (
      <div className="mb-6 rounded-card border border-border bg-surface p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Biznes nomi</p>
            <p className="text-lg font-semibold text-slate-900">{business.name}</p>
            <p className="mt-2 text-sm text-slate-500">{business.address || "Manzil kiritilmagan"}</p>
            <p className="text-sm text-slate-500">{business.phone || "Telefon kiritilmagan"}</p>
          </div>
          {canManage ? (
            <button
              onClick={() => setEditing(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-surface-muted"
            >
              <Pencil className="h-3.5 w-3.5" /> Tahrirlash
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mb-6 space-y-3 rounded-card border border-border bg-surface p-4"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Biznes nomi</label>
          <input {...register("name")} className="w-full rounded-md border border-border px-3 py-2 text-sm" />
          {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name.message}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Manzil</label>
          <input {...register("address")} className="w-full rounded-md border border-border px-3 py-2 text-sm" />
          {errors.address ? <p className="mt-1 text-xs text-red-600">{errors.address.message}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Telefon</label>
          <input {...register("phone")} className="w-full rounded-md border border-border px-3 py-2 text-sm" />
          {errors.phone ? <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p> : null}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-60"
        >
          {isPending ? "Saqlanmoqda..." : "Saqlash"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-slate-600"
        >
          Bekor qilish
        </button>
      </div>
    </form>
  );
}
