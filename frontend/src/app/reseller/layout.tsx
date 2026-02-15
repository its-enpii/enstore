"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function ResellerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout role="reseller">{children}</DashboardLayout>;
}
