"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/layout/error-state";

export default function MarketingError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <ErrorState
        title="Sahifani yuklab bo'lmadi."
        description="Internet aloqasi yoki server bilan muammo bo'lishi mumkin. Qayta urinib ko'ring."
        onRetry={reset}
      />
    </main>
  );
}
