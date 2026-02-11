import {
  CheckCircleRounded,
  ContentCopyRounded,
  DownloadRounded,
  CancelRounded,
  DescriptionRounded,
  SportsEsportsRounded,
  DiamondRounded,
} from "@mui/icons-material";
import { motion } from "motion/react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { TransactionStatus } from "@/lib/api";
import { useState } from "react";

interface PaymentResultProps {
  status: "success" | "failed" | "expired";
  transaction: TransactionStatus;
}

export default function PaymentResult({
  status,
  transaction,
}: PaymentResultProps) {
  const [copied, setCopied] = useState(false);

  const isSuccess = status === "success";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center py-10">
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={`mb-8 flex h-24 w-24 items-center justify-center rounded-full ${
          isSuccess
            ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
            : "bg-red-500 text-white shadow-lg shadow-red-500/30"
        }`}
      >
        {isSuccess ? (
          <CheckCircleRounded sx={{ fontSize: 64 }} />
        ) : (
          <CancelRounded sx={{ fontSize: 64 }} />
        )}
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4 text-center text-3xl font-bold text-brand-500 lg:text-4xl"
      >
        {isSuccess ? "Transaction Successful!" : "Transaction Failed"}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12 text-center text-brand-500/60"
      >
        {isSuccess
          ? "Your top-up has been processed and delivered."
          : "We could not process your transaction. Please try again."}
      </motion.p>

      {/* Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-10 w-full max-w-lg rounded-[32px] border border-brand-500/5 bg-white p-2 shadow-sm lg:p-4"
      >
        {/* Invoice ID */}
        <div className="mb-2 flex items-center justify-between rounded-[24px] bg-cloud-100/50 p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-ocean-500 shadow-sm">
              <DescriptionRounded />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wide text-brand-500/40 uppercase">
                Invoice ID
              </p>
              <p className="font-bold text-brand-500 md:text-lg">
                {transaction.transaction_code}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleCopy(transaction.transaction_code)}
            className="rounded-xl p-2 text-brand-500/40 transition-colors hover:bg-white hover:text-ocean-500"
          >
            {copied ? (
              <CheckCircleRounded fontSize="small" className="text-green-500" />
            ) : (
              <ContentCopyRounded fontSize="small" />
            )}
          </button>
        </div>

        {/* Game */}
        <div className="mb-2 flex items-center gap-4 rounded-[24px] bg-cloud-100/50 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-ocean-500 shadow-sm">
            <SportsEsportsRounded />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wide text-brand-500/40 uppercase">
              Game
            </p>
            <p className="font-bold text-brand-500 md:text-lg">
              {transaction.product.name}
            </p>
          </div>
        </div>

        {/* Item Delivered */}
        <div className="flex items-center justify-between rounded-[24px] bg-cloud-100/50 p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-ocean-500 shadow-sm">
              <DiamondRounded />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wide text-brand-500/40 uppercase">
                Item Delivered
              </p>
              <p className="font-bold text-brand-500 md:text-lg">
                {transaction.product.item}
              </p>
            </div>
          </div>
          {isSuccess && (
            <span className="hidden rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-600 sm:inline-block">
              DELIVERED
            </span>
          )}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex w-full max-w-lg flex-col gap-4 sm:flex-row"
      >
        <Button
          variant="white"
          className="w-full justify-center border border-brand-500/10"
          icon={<DownloadRounded />}
          onClick={() => window.print()}
        >
          Download E-Receipt
        </Button>
        <Link href="/" className="w-full">
          <Button variant="primary" className="w-full justify-center">
            Back to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
