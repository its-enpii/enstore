import {
  CheckCircleRounded,
  ContentCopyRounded,
  DownloadRounded,
  CancelRounded,
  DescriptionRounded,
  SportsEsportsRounded,
  DiamondRounded,
  ArrowBackRounded,
} from "@mui/icons-material";
import { motion } from "motion/react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { TransactionStatus } from "@/lib/api";
import { useState } from "react";

interface PaymentResultProps {
  status: "success" | "failed" | "expired" | "refunded";
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
    <div className="flex flex-col items-center justify-center w-full lg:max-w-5/12 mx-auto px-6 py-8 md:px-8 md:py-10 bg-smoke-200 shadow-enstore rounded-[48px]">
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={`mb-10 flex h-24 w-24 items-center justify-center rounded-full ${
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
        className={`mb-4 text-center text-2xl md:text-3xl font-bold lg:text-4xl ${isSuccess ? "text-ocean-500" : "text-red-500"}`}
      >
        {isSuccess ? "Transaction Successful!" : "Transaction Failed"}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-sm md:text-base mb-10 text-center text-brand-500/40"
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
        className="mb-8 w-full"
      >
        {/* Invoice ID */}
        <div className="mb-4 flex items-center justify-between rounded-[24px] bg-cloud-200 p-4 border border-brand-500/5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-smoke-200 border border-brand-500/5 text-ocean-500">
              <DescriptionRounded />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium tracking-wide text-brand-500/40 uppercase">
                Invoice ID
              </p>
              <p className="text-sm md:text-base font-bold text-brand-500/90">
                {transaction.transaction_code}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleCopy(transaction.transaction_code)}
            className="rounded-xl p-2 text-brand-500/40 transition-colors duration-300 hover:bg-smoke-200 hover:text-ocean-500"
          >
            {copied ? (
              <CheckCircleRounded fontSize="small" className="text-green-500" />
            ) : (
              <ContentCopyRounded fontSize="small" />
            )}
          </button>
        </div>

        {/* Game */}
        <div className="mb-4 flex items-center justify-between rounded-[24px] bg-cloud-200 p-4 border border-brand-500/5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-smoke-200 border border-brand-500/5 text-ocean-500">
              <SportsEsportsRounded />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium tracking-wide text-brand-500/40 uppercase">
                Game
              </p>
              <p className="text-sm md:text-base font-bold text-brand-500/90">
                {transaction.product.name}
              </p>
            </div>
          </div>
        </div>

        {/* Item Delivered */}
        <div className="flex items-center justify-between rounded-[24px] bg-cloud-200 p-4 border border-brand-500/5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-smoke-200 border border-brand-500/5 text-ocean-500">
              <DiamondRounded />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium tracking-wide text-brand-500/40 uppercase">
                Item Delivered
              </p>
              <p className="text-sm md:text-base font-bold text-brand-500/90">
                {transaction.product.item}
              </p>
            </div>
          </div>
          {isSuccess && (
            <span className="hidden rounded-full bg-green-500/10 border border-green-500/20 px-3 py-2 text-xs text-green-600 sm:inline-block">
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
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
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
          <Button variant="primary" icon={<ArrowBackRounded />} className="w-full justify-center">
            Back to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
