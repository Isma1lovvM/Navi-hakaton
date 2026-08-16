"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { createStaffBooking } from "@/lib/actions/bookings";
import type { Resource, Service } from "@/types/database";

function nowLocalIso() {
  const d = new Date();
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function WalkInBookingForm({
  businessId,
  services,
  resources,
}: {
  businessId: string;
  services: Service[];
  resources: Pick<Resource, "id" | "name">[];
}) {
  const [open, setOpen] = useState(false);
  const [serviceId, setServiceId] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [startAt, setStartAt] = useState(nowLocalIso());
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setServiceId("");
    setResourceId("");
    setCustomerName("");
    setCustomerPhone("");
    setStartAt(nowLocalIso());
  };

  const submit = () => {
    startTransition(async () => {
      const result = await createStaffBooking({
        business_id: businessId,
        service_id: serviceId,
        resource_id: resourceId,
        start_at: new Date(startAt).toISOString(),
        customer_name: customerName,
        customer_phone: customerPhone,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Booking qo'shildi");
      reset();
      setOpen(false);
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-4 flex items-center gap-1.5 rounded-md bg-accent-600 px-3 py-2 text-sm font-medium text-white hover:bg-accent-700"
      >
        <Plus className="h-4 w-4" /> Booking qo&apos;shish
      </button>
    );
  }

  const canSubmit = serviceId && resourceId && startAt && customerName.trim().length >= 2 && customerPhone.trim().length >= 9;

  return (
    <div className="mb-6 space-y-3 rounded-card border border-border bg-surface p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Xizmat</label>
          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="w-full rounded-md border border-border px-3 py-2 text-sm">
            <option value="">Tanlang...</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.price.toLocaleString("uz-UZ")} so&apos;m)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Usta</label>
          <select value={resourceId} onChange={(e) => setResourceId(e.target.value)} className="w-full rounded-md border border-border px-3 py-2 text-sm">
            <option value="">Tanlang...</option>
            {resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Sana va vaqt</label>
          <input
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Mijoz ismi</label>
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full rounded-md border border-border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Telefon</label>
          <input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="+998901234567"
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={!canSubmit || isPending}
          className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-60"
        >
          {isPending ? "Saqlanmoqda..." : "Booking yaratish"}
        </button>
        <button onClick={() => setOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-slate-600">
          Bekor qilish
        </button>
      </div>
    </div>
  );
}
