"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Power } from "lucide-react";
import { updateService, toggleServiceActive } from "@/lib/actions/services";
import type { Service } from "@/types/database";

export function ServiceRowActions({ service }: { service: Service }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(service.name);
  const [duration, setDuration] = useState(String(service.duration_minutes));
  const [price, setPrice] = useState(String(service.price));
  const [isPending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      const result = await updateService(service.id, {
        name,
        duration_minutes: Number(duration),
        price: Number(price),
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Xizmat yangilandi");
      setEditing(false);
    });
  };

  const toggleActive = () => {
    startTransition(async () => {
      const result = await toggleServiceActive(service.id, !service.is_active);
      if (result.error) toast.error(result.error);
    });
  };

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-28 rounded-md border border-border px-2 py-1 text-xs"
        />
        <input
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          type="number"
          className="w-16 rounded-md border border-border px-2 py-1 text-xs"
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          className="w-20 rounded-md border border-border px-2 py-1 text-xs"
        />
        <button
          onClick={save}
          disabled={isPending}
          className="rounded-md bg-accent-600 px-2 py-1 text-xs font-medium text-white hover:bg-accent-700 disabled:opacity-60"
        >
          Saqlash
        </button>
        <button
          onClick={() => setEditing(false)}
          className="rounded-md border border-border px-2 py-1 text-xs font-medium text-slate-600"
        >
          Bekor
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => setEditing(true)}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-slate-500 hover:border-accent-500 hover:text-accent-700"
        title="Tahrirlash"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={toggleActive}
        disabled={isPending}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-slate-500 hover:border-accent-500 hover:text-accent-700 disabled:opacity-60"
        title={service.is_active ? "Nofaol qilish" : "Faollashtirish"}
      >
        <Power className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
