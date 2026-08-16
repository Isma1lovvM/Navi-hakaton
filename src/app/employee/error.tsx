"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ErrorState } from "@/components/layout/error-state";

export default function EmployeeError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  if (error.message === "UNAUTHENTICATED") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="max-w-sm text-center">
          <p className="font-medium text-slate-700">Sizga hech qanday biznes biriktirilmagan.</p>
          <p className="mt-1 text-sm text-slate-500">
            Bu hisobda faol business_members yozuvi topilmadi. Boshqa hisob bilan kiring yoki administratorga murojaat qiling.
          </p>
          <Link
            href="/auth/login"
            className="mt-4 inline-block rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700"
          >
            Qayta kirish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <ErrorState onRetry={reset} />
    </div>
  );
}
