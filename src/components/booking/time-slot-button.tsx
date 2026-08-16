"use client";

import { cn } from "@/lib/utils/cn";

export function TimeSlotButton({
  label,
  available,
  selected,
  onClick,
}: {
  label: string;
  available: boolean;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!available}
      onClick={onClick}
      className={cn(
        "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
        !available && "cursor-not-allowed border-border bg-surface-muted text-slate-300 line-through",
        available && !selected && "border-border bg-surface text-slate-700 hover:border-accent-500",
        selected && "border-accent-600 bg-accent-600 text-white"
      )}
    >
      {label}
    </button>
  );
}
