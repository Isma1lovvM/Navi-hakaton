"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateResourceHoursDay } from "@/lib/actions/employees";
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
  const [startTime, setStartTime] = useState(initial.start_time?.slice(0, 5) ?? "10:00");
  const [endTime, setEndTime] = useState(initial.end_time?.slice(0, 5) ?? "18:00");
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
    <div className="flex flex-wrap items-center gap-2.5 border-b border-border py-2 text-sm last:border-0">
      <span className="w-24 shrink-0 text-slate-600">{DAY_LABELS[initial.day_of_week]}</span>
      <label className="flex items-center gap-1.5 text-xs text-slate-500">
        <input type="checkbox" checked={isOff} onChange={(e) => setIsOff(e.target.checked)} />
        Dam olish
      </label>
      {!isOff ? (
        <>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-md border border-border px-2 py-1 text-xs" />
          <span className="text-slate-400">—</span>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="rounded-md border border-border px-2 py-1 text-xs" />
        </>
      ) : null}
      <button
        onClick={save}
        disabled={isPending}
        className="ml-auto rounded-md border border-accent-600 px-2.5 py-1 text-xs font-medium text-accent-700 hover:bg-accent-50 disabled:opacity-60"
      >
        {isPending ? "..." : "Saqlash"}
      </button>
    </div>
  );
}

export function ResourceHoursForm({ resourceId, hours }: { resourceId: string; hours: ResourceHours[] }) {
  const byDay = new Map(hours.map((h) => [h.day_of_week, h]));

  return (
    <div className="mt-2 rounded-card border border-border bg-surface-muted p-3">
      {ORDER.map((day) => {
        const row = byDay.get(day);
        if (!row) return null;
        return <DayRow key={day} resourceId={resourceId} initial={row} />;
      })}
    </div>
  );
}
