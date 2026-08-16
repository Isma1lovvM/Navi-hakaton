"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateResourceHoursDay, initResourceHoursDefaults } from "@/lib/actions/employees";
import type { DayOfWeek, ResourceHours } from "@/types/database";

const DAY_LABELS: Record<DayOfWeek, string> = {
  1: "Dushanba",
  2: "Seshanba",
  3: "Chorshanba",
  4: "Payshanba",
  5: "Juma",
  6: "Shanba",
  0: "Yakshanba",
};

const ORDER: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];

function DayRow({ resourceId, initial }: { resourceId: string; initial: ResourceHours }) {
  const [isOff, setIsOff] = useState(initial.is_off);
  const [startTime, setStartTime] = useState(initial.start_time?.slice(0, 5) ?? "09:00");
  const [endTime, setEndTime] = useState(initial.end_time?.slice(0, 5) ?? "21:00");
  const [isPending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      const result = await updateResourceHoursDay(resourceId, {
        day_of_week: initial.day_of_week,
        is_off: isOff,
        start_time: isOff ? null : startTime,
        end_time: isOff ? null : endTime,
      });
      if (result.error) toast.error(result.error);
      else toast.success(`${DAY_LABELS[initial.day_of_week]} saqlandi`);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border px-3 py-2.5 last:border-0">
      <span className="w-24 shrink-0 text-sm font-medium text-slate-700">{DAY_LABELS[initial.day_of_week]}</span>
      <label className="flex items-center gap-1.5 text-sm text-slate-500">
        <input type="checkbox" checked={isOff} onChange={(e) => setIsOff(e.target.checked)} />
        Dam olish kuni
      </label>
      {!isOff ? (
        <>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-md border border-border px-2 py-1 text-sm" />
          <span className="text-slate-400">—</span>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="rounded-md border border-border px-2 py-1 text-sm" />
        </>
      ) : null}
      <button
        onClick={save}
        disabled={isPending}
        className="ml-auto rounded-md border border-accent-600 px-3 py-1 text-xs font-medium text-accent-700 hover:bg-accent-50 disabled:opacity-60"
      >
        {isPending ? "Saqlanmoqda..." : "Saqlash"}
      </button>
    </div>
  );
}

export function ResourceHoursForm({ resourceId, hours }: { resourceId: string; hours: ResourceHours[] }) {
  const [isPending, startTransition] = useTransition();
  const byDay = new Map(hours.map((h) => [h.day_of_week, h]));

  if (hours.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border p-3 text-center">
        <p className="text-xs text-slate-400">Bu xodim uchun ish vaqtlari hali sozlanmagan.</p>
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await initResourceHoursDefaults(resourceId);
              if (result.error) toast.error(result.error);
              else toast.success("Standart ish vaqtlari yaratildi");
            })
          }
          className="mt-2 rounded-md border border-accent-600 px-3 py-1 text-xs font-medium text-accent-700 hover:bg-accent-50 disabled:opacity-60"
        >
          {isPending ? "Yaratilmoqda..." : "Standart vaqtlarni yaratish"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border">
      {ORDER.map((day) => {
        const row = byDay.get(day);
        if (!row) return null;
        return <DayRow key={day} resourceId={resourceId} initial={row} />;
      })}
    </div>
  );
}
