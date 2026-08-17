"use client";

import { useEffect } from "react";

/**
 * Registra el service worker (public/sw.js) solo en producción — en dev
 * interferiría con el Fast Refresh de Next.js al servir chunks cacheados.
 */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
