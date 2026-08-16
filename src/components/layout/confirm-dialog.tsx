"use client";

import type { ConfirmDialogProps } from "@/components/types";
import { cn } from "@/lib/utils/cn";

/** Deliberately dependency-free (no Radix) — fast to ship for a hackathon,
 * swap for shadcn/ui's Dialog later if there's time to spare. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Tasdiqlash",
  cancelLabel = "Bekor qilish",
  destructive,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-card bg-surface p-5 shadow-lg">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-surface-muted"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium text-white",
              destructive ? "bg-red-600 hover:bg-red-700" : "bg-accent-600 hover:bg-accent-700"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
