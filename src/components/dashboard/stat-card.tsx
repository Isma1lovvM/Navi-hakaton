import { cn } from "@/lib/utils/cn";
import type { StatCardProps } from "@/components/types";

const TONE_CLASS: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-slate-900",
  success: "text-emerald-600",
  warning: "text-amber-600",
  error: "text-red-600",
};

export function StatCard({ label, value, icon: Icon, tone = "default", hint }: StatCardProps) {
  return (
    <div className="rounded-card border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        {Icon ? <Icon className="h-4 w-4 text-slate-400" /> : null}
      </div>
      <div className={cn("mt-2 text-2xl font-semibold", TONE_CLASS[tone])}>{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-400">{hint}</div> : null}
    </div>
  );
}
