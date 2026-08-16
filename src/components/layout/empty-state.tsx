import type { EmptyStateProps } from "@/components/types";

export function EmptyState({ title, description, icon: Icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border py-12 text-center">
      {Icon ? <Icon className="mb-3 h-8 w-8 text-slate-300" /> : null}
      <p className="font-medium text-slate-700">{title}</p>
      {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
