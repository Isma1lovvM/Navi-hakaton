"use client";

import { cn } from "@/lib/utils/cn";
import type { EmployeeCardProps } from "@/components/types";

const DOT: Record<NonNullable<EmployeeCardProps["statusLabel"]>, string> = {
  Available: "bg-emerald-500",
  "With customer": "bg-blue-500",
  "Off today": "bg-slate-300",
};

export function EmployeeCard({ resource, statusLabel, selected, onSelect }: EmployeeCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(resource)}
      className={cn(
        "flex w-full items-center justify-between rounded-card border p-3 text-left transition-colors",
        selected ? "border-accent-600 bg-accent-50" : "border-border bg-surface hover:border-accent-500"
      )}
    >
      <span className="font-medium text-slate-900">{resource.name}</span>
      {statusLabel ? (
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className={cn("h-2 w-2 rounded-full", DOT[statusLabel])} />
          {statusLabel}
        </span>
      ) : null}
    </button>
  );
}
