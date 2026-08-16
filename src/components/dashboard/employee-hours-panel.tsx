"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Clock, Power } from "lucide-react";
import { EmployeeCard } from "@/components/dashboard/employee-card";
import { ResourceHoursForm } from "@/components/dashboard/resource-hours-form";
import { toggleEmployeeActive } from "@/lib/actions/employees";
import type { Resource, ResourceHours } from "@/types/database";

export function EmployeeHoursPanel({
  memberId,
  resource,
  hours,
}: {
  memberId: string;
  resource: Pick<Resource, "id" | "name" | "type" | "is_active">;
  hours: ResourceHours[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const toggleActive = () => {
    startTransition(async () => {
      const result = await toggleEmployeeActive(memberId, resource.id, !resource.is_active);
      if (result.error) toast.error(result.error);
    });
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <EmployeeCard resource={resource} statusLabel={resource.is_active ? "Available" : "Off today"} />
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-slate-500 hover:border-accent-500 hover:text-accent-700"
          title="Ish vaqtlari"
          aria-label="Ish vaqtlarini ko'rsatish"
          aria-expanded={open}
        >
          <Clock className="h-4 w-4" />
        </button>
        <button
          onClick={toggleActive}
          disabled={isPending}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-slate-500 hover:border-accent-500 hover:text-accent-700 disabled:opacity-60"
          title={resource.is_active ? "Nofaol qilish" : "Faollashtirish"}
        >
          <Power className="h-4 w-4" />
        </button>
      </div>
      {open ? <ResourceHoursForm resourceId={resource.id} hours={hours} /> : null}
    </div>
  );
}
