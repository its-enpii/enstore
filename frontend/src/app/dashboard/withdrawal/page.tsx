"use client";

import PageHeader from "@/components/dashboard/PageHeader";
import { EngineeringRounded, SupportAgentRounded } from "@mui/icons-material";
import Link from "next/link";
import DashboardButton from "@/components/dashboard/DashboardButton";
import { WithdrawalForm } from "@/components/dashboard/WithdrawalForm";

export default function WithdrawalPage() {
  return (
    <>
      <div className="space-y-8">
        <PageHeader
          title="Withdraw Balance"
          emoji="💸"
          description="Request a withdrawal of your available balance."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Wallet", href: "/dashboard/balance" },
            { label: "Withdraw" },
          ]}
        />

        <WithdrawalForm />
      </div>
    </>
  );
}
