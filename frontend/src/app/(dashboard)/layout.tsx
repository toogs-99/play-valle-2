import React from "react";
import DashboardShell from "@/components/DashboardShell";
import { BrandProvider } from "@/context/BrandContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BrandProvider>
      <DashboardShell>{children}</DashboardShell>
    </BrandProvider>
  );
}
