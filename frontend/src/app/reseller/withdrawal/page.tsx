"use client";

import PageHeader from "@/components/dashboard/PageHeader";
import { EngineeringRounded, SupportAgentRounded } from "@mui/icons-material";
import Link from "next/link";
import DashboardButton from "@/components/dashboard/DashboardButton";

export default function ResellerWithdrawalPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Withdraw Balance"
        emoji="💸"
        description="Request a withdrawal of your reseller balance."
        breadcrumbs={[
          { label: "Dashboard", href: "/reseller/dashboard" },
          { label: "Wallet", href: "/reseller/balance" },
          { label: "Withdraw" },
        ]}
      />

      <div className="bg-smoke-200 dark:bg-brand-800 rounded-[28px] border border-brand-500/5 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
         <div className="w-24 h-24 bg-ocean-500/10 rounded-full flex items-center justify-center text-ocean-500 mb-6 animate-pulse">
            <EngineeringRounded sx={{ fontSize: 48 }} />
         </div>
         <h2 className="text-2xl font-black text-brand-500 dark:text-smoke-200 mb-2">Feature Under Maintenance</h2>
         <p className="text-brand-500/50 max-w-md mx-auto mb-8 leading-relaxed">
            Reseller withdrawal system is currently being optimized for faster processing. This feature will be available soon.
         </p>
         
         <div className="flex gap-4">
            <Link href="/reseller/balance">
               <DashboardButton variant="secondary">Go Back</DashboardButton>
            </Link>
            <Link href="/help">
               <DashboardButton variant="primary" icon={<SupportAgentRounded />}>Contact Support</DashboardButton>
            </Link>
         </div>
      </div>
    </div>
  );
}
