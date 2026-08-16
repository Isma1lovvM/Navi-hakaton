"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateBusinessHoursDay } from "@/lib/actions/business";
import type { BusinessHours, DayOfWeek } from "@/types/database";

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

function DayRow({ initial }: { initial: BusinessHours }) {
  const [isClosed, setIsClosed] = useState(initial.is_closed);
  const [openTime, setOpenTime] = useState(initial.open_time?.slice(0, 5) ?? "09:00");
  const [closeTime, setCloseTime] = useState(initial.close_time?.slice(0, 5) ?? "21:00");
  const [isPending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      const result = await updateBusinessHoursDay({
        day_of_week: initial.day_of_week,
        is_closed: isClosed,
        open_time: isClosed ? null : openTime,
        close_time: isClosed ? null : closeTime,
      });
      if (result.error) toast.error(result.error);
      else toast.success(`${DAY_LABELS[initial.day_of_week]} saqlandi`);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border py-3 last:border-0">
      <span className="w-28 shrink-0 text-sm font-medium text-slate-700">{DAY_LABELS[initial.day_of_week]}</span>
      <label className="flex items-center gap-1.5 text-sm text-slate-500">
        <input type="checkbox" checked={isClosed} onChange={(e) => setIsClosed(e.target.checked)} />
        Yopiq
      </label>
      {!isClosed ? (
        <>
          <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} className="rounded-md border border-border px-2 py-1 text-sm" />
          <span className="text-slate-400">—</span>
          <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} className="rounded-md border border-border px-2 py-1 text-sm" />
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

export function BusinessHoursForm({ hours }: { hours: BusinessHours[] }) {
  const byDay = new Map(hours.map((h) => [h.day_of_week, h]));

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      {ORDER.map((day) => {
        const row = byDay.get(day);
        if (!row) return null;
        return <DayRow key={day} initial={row} />;
      })}
    </div>
  );
}
