import { AlertTriangle } from "lucide-react";
import type { ErrorStateProps } from "@/components/types";

export function ErrorState({
  title = "Nimadir xato ketdi.",
  description = "Iltimos, qayta urinib ko'ring.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-red-100 bg-red-50 py-12 text-center">
      <AlertTriangle className="mb-3 h-8 w-8 text-red-400" />
      <p className="font-medium text-red-700">{title}</p>
      <p className="mt-1 text-sm text-red-500">{description}</p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Qayta urinish
        </button>
      ) : null}
    </div>
  );
}
