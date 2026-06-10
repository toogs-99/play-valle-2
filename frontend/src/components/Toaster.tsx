"use client";

import React, { useEffect, useState } from "react";
import { ToastType } from "@/lib/useToast";

export function Toaster() {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ description: string; duration?: number }>;
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastType = {
        id,
        description: customEvent.detail.description,
        duration: customEvent.detail.duration,
      };

      setToasts((prev) => [...prev, newToast]);

      const duration = customEvent.detail.duration ?? 3000;
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    };

    window.addEventListener("licitflow-toast", handleToast);
    return () => {
      window.removeEventListener("licitflow-toast", handleToast);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto bg-card/85 backdrop-blur-md border border-border text-foreground text-xs font-semibold px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-3 min-w-[280px] max-w-[380px] animate-fade-in-slide-up transition-all duration-300"
        >
          <div className="flex-1 font-text whitespace-pre-wrap">{t.description}</div>
        </div>
      ))}
    </div>
  );
}

