import {
  CheckCircleRounded,
  ContentCopyRounded,
  DownloadRounded,
  CancelRounded,
  DescriptionRounded,
  SportsEsportsRounded,
  DiamondRounded,
  ArrowBackRounded,
  SyncRounded,
} from "@mui/icons-material";
import { motion } from "motion/react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { TransactionStatus } from "@/lib/api";
import { useState } from "react";

interface PaymentResultProps {
  status: "success" | "failed" | "expired" | "processing";
  transaction: TransactionStatus;
}

export default function PaymentResult({
  status,
  transaction,
}: PaymentResultProps) {
  const [copied, setCopied] = useState(false);

  const isSuccess = status === "success";
  const isProcessing = status === "processing";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto flex w-full flex-col items-center justify-center rounded-[48px] bg-smoke-200 px-6 py-8 shadow-enstore md:px-8 md:py-10 lg:max-w-5/12">
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={`mb-10 flex h-24 w-24 items-center justify-center rounded-full ${
          isSuccess
            ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
            : isProcessing
              ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/30"
              : "bg-red-500 text-white shadow-lg shadow-red-500/30"
        }`}
      >
        {isSuccess ? (
          <CheckCircleRounded sx={{ fontSize: 64 }} />
        ) : isProcessing ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <SyncRounded sx={{ fontSize: 64 }} />
          </motion.div>
        ) : (
          <CancelRounded sx={{ fontSize: 64 }} />
        )}
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`mb-4 text-center text-2xl font-bold md:text-3xl lg:text-4xl ${
          isSuccess
            ? "text-ocean-500"
            : isProcessing
              ? "text-yellow-600"
              : "text-red-500"
        }`}
      >
        {isSuccess
          ? "Transaction Successful!"
          : isProcessing
            ? "Payment Received!"
            : "Transaction Failed"}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-10 text-center text-sm text-brand-500/40 md:text-base"
      >
        {isSuccess
          ? "Your top-up has been processed and delivered."
          : isProcessing
            ? "Your payment is successful. We are now processing your top-up."
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
        <div className="mb-4 flex items-center justify-between rounded-[24px] border border-brand-500/5 bg-cloud-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-500/5 bg-smoke-200 text-ocean-500">
              <DescriptionRounded />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium tracking-wide text-brand-500/40 uppercase">
                Invoice ID
              </p>
              <p className="text-sm font-bold text-brand-500/90 md:text-base">
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
        <div className="mb-4 flex items-center justify-between rounded-[24px] border border-brand-500/5 bg-cloud-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-500/5 bg-smoke-200 text-ocean-500">
              <SportsEsportsRounded />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium tracking-wide text-brand-500/40 uppercase">
                Game
              </p>
              <p className="text-sm font-bold text-brand-500/90 md:text-base">
                {transaction.product.name}
              </p>
            </div>
          </div>
        </div>

        {/* Item Delivered */}
        <div className="flex items-center justify-between rounded-[24px] border border-brand-500/5 bg-cloud-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-500/5 bg-smoke-200 text-ocean-500">
              <DiamondRounded />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium tracking-wide text-brand-500/40 uppercase">
                Item Delivered
              </p>
              <p className="text-sm font-bold text-brand-500/90 md:text-base">
                {transaction.product.item}
              </p>
            </div>
          </div>
          {isSuccess ? (
            <span className="hidden rounded-full border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs text-green-600 sm:inline-block">
              DELIVERED
            </span>
          ) : (
            isProcessing && (
              <span className="hidden rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-600 sm:inline-block">
                PROCESSING
              </span>
            )
          )}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2"
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
          <Button
            variant="primary"
            icon={<ArrowBackRounded />}
            className="w-full justify-center"
          >
            Back to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
