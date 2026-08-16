"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="uz">
      <body className="antialiased">
        <div className="flex min-h-screen items-center justify-center bg-surface-muted p-4">
          <div className="w-full max-w-sm rounded-card border border-border bg-surface p-6 text-center shadow-sm">
            <p className="font-medium text-slate-900">Nimadir xato ketdi.</p>
            <p className="mt-1 text-sm text-slate-500">Sahifani qayta yuklab ko&apos;ring.</p>
            <button
              onClick={reset}
              className="mt-4 rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700"
            >
              Qayta urinish
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
