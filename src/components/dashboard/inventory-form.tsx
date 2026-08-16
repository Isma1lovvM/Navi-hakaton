"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { adjustInventory, createProduct } from "@/lib/actions/inventory";

export function QuickAdjust({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();

  const adjust = (change: number) => {
    startTransition(async () => {
      const result = await adjustInventory({ product_id: productId, change, reason: change > 0 ? "RESTOCK" : "USAGE" });
      if (result.error) toast.error(result.error);
    });
  };

  return (
    <div className="flex items-center gap-1">
      <button
        disabled={isPending}
        onClick={() => adjust(-1)}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-slate-500 hover:border-accent-500"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <button
        disabled={isPending}
        onClick={() => adjust(1)}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-slate-500 hover:border-accent-500"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function AddProductForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [minQuantity, setMinQuantity] = useState("3");
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    startTransition(async () => {
      const result = await createProduct({ name, quantity: Number(quantity), min_quantity: Number(minQuantity), unit: "dona" });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Mahsulot qo'shildi");
      setName("");
      setOpen(false);
    });
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 rounded-md bg-accent-600 px-3 py-2 text-sm font-medium text-white hover:bg-accent-700">
        <Plus className="h-4 w-4" /> Mahsulot qo&apos;shish
      </button>
    );
  }

  return (
    <div className="mb-6 flex flex-wrap items-end gap-3 rounded-card border border-border bg-surface p-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Nomi</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-md border border-border px-3 py-2 text-sm" />
      </div>
      <div className="w-24">
        <label className="mb-1 block text-sm font-medium text-slate-700">Miqdor</label>
        <input value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" className="w-full rounded-md border border-border px-3 py-2 text-sm" />
      </div>
      <div className="w-24">
        <label className="mb-1 block text-sm font-medium text-slate-700">Min</label>
        <input value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)} type="number" className="w-full rounded-md border border-border px-3 py-2 text-sm" />
      </div>
      <button onClick={submit} disabled={!name || isPending} className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-60">
        Saqlash
      </button>
      <button onClick={() => setOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-slate-600">
        Bekor qilish
      </button>
    </div>
  );
}
