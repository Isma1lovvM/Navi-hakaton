"use client";

import { cn } from "@/lib/utils/cn";
import type { ServiceCardProps } from "@/components/types";

export function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(service)}
      className={cn(
        "w-full rounded-card border p-4 text-left transition-colors",
        selected ? "border-accent-600 bg-accent-50" : "border-border bg-surface hover:border-accent-500"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-slate-900">{service.name}</span>
        <span className="text-sm font-semibold text-accent-700">
          {service.price.toLocaleString("uz-UZ")} so&apos;m
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500">{service.duration_minutes} daqiqa</p>
    </button>
  );
}
