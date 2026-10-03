"use client";

// Meldet den Service Worker an (nur im fertigen Build) — damit läuft die App offline.

import { useEffect } from "react";

export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // ohne Service Worker läuft die App trotzdem, nur nicht offline
    });
  }, []);
  return null;
}
