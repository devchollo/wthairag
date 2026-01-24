"use client";

import { useEffect } from "react";

const SERVICE_WORKER_URL = "/sw.js";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!("serviceWorker" in navigator)) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        await navigator.serviceWorker.register(SERVICE_WORKER_URL);
      } catch (error) {
        console.warn("Service worker registration failed", error);
      }
    };

    window.addEventListener("load", registerServiceWorker);

    return () => {
      window.removeEventListener("load", registerServiceWorker);
    };
  }, []);

  return null;
}
