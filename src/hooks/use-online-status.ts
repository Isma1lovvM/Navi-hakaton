"use client";

import { useEffect, useState } from "react";

/** Spec section 20 — offline-friendly UX. Never trust this alone to block
 * a write; it's for showing 🟢/🟠 status and disabling the submit button
 * pre-emptively. The real guarantee is: never show "confirmed" until the
 * server call actually resolves (see book_appointment RPC usage). */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return online;
}
