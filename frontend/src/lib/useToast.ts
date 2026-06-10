"use client";

import * as React from "react";

export interface ToastType {
  id: string;
  description: string;
  duration?: number;
}

export const toast = (options: { description: string; duration?: number }) => {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("licitflow-toast", { detail: options });
    window.dispatchEvent(event);
  }
};

export const useToast = () => {
  return {
    toast,
  };
};

