"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ContentCopyRounded,
  CheckCircleRounded,
  TimerRounded,
  FileDownloadRounded,
  SyncRounded,
} from "@mui/icons-material";
import Button from "@/components/ui/Button";
import Accordion from "@/components/ui/Accordion";
import {
  API_BASE_URL,
  getTransactionStatus,
  cancelTransaction,
  type TransactionStatus,
} from "@/lib/api";
import Breadcrumb from "@/components/services/breadcrumb";
import PaymentResult from "@/components/services/PaymentResult";

/**
 * Countdown Timer Component
 */
function CountdownTimer({
  targetDate,
  onExpire,
}: {
  targetDate: string;
  onExpire?: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState("");
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;

      if (distance < 0) {
        if (!hasExpired && onExpire) {
          setHasExpired(true);
          onExpire();
        }
        return "00:00:00";
      }

      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, hasExpired, onExpire]);

  return <>{timeLeft}</>;
}

export default function PaymentPage() {
  const imgRef = useRef(null);

  const searchParams = useSearchParams();
  const transactionCode = searchParams.get("transactionCode");

  const [transaction, setTransaction] = useState<TransactionStatus | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isTimeExpired, setIsTimeExpired] = useState(false);

  const handleDownloadQR = async (qrUrl: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/download-qr?url=${encodeURIComponent(qrUrl)}`,
      );

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "qr-code.png";
      a.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Gagal download");
    }
  };

  const fetchStatus = async () => {
    if (!transactionCode) return;
    try {
      const res = await getTransactionStatus(transactionCode);
      if (res.success) {
        setTransaction(res.data);
      } else {
        setError(res.message || "Failed to load transaction");
      }
    } catch (err) {
      setError("An error occurred while loading transaction");
    } finally {
      setLoading(false);
    }
  };

  const isPaid =
    transaction?.status === "success" || transaction?.payment_status === "paid";
  const isExpired =
    transaction?.status === "failed" ||
    transaction?.status === "expired" ||
    isTimeExpired;

  useEffect(() => {
    if (transactionCode && !isPaid && !isExpired) {
      if (!transaction) fetchStatus(); // Initial fetch

      const interval = setInterval(fetchStatus, 10000); // Poll every 10s
      return () => clearInterval(interval);
    } else if (!transactionCode) {
      setError("Transaction code not found");
      setLoading(false);
    }
  }, [transactionCode, isPaid, isExpired]);

  const handleCancelOrder = async () => {
    if (!transactionCode) return;

    if (!confirm("Apakah anda yakin ingin membatalkan pesanan ini?")) {
      return;
    }

    try {
      setLoading(true);
      const res = await cancelTransaction(transactionCode);
      if (res.success) {
        await fetchStatus();
      } else {
        alert(res.message || "Gagal membatalkan pesanan");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat membatalkan pesanan");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID").format(price);
  };

  if (loading && !transaction) {
    return (
      <div className="flex h-screen items-center justify-center bg-cloud-200">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-ocean-500/20 border-t-ocean-500" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-cloud-200 p-4">
        <p className="font-medium text-red-500">
          {error || "Transaction not found"}
        </p>
        <Link href="/">
          <Button variant="primary" size="md">
            Go Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-cloud-200 pt-16 pb-28">
      <div className="container mx-auto px-4 lg:px-0">
        <Breadcrumb
          items={[
            { label: "Service", href: "/services" },
            {
              label: transaction.product.name || "Product",
              href: `/services/${transaction.product.slug}`,
            },
            { label: "Payment", href: `#` },
          ]}
        />

        {isPaid || isExpired ? (
          <PaymentResult
            status={isPaid ? "success" : "failed"}
            transaction={transaction}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column: Summary Card + Expiry Banner */}
            <div className="col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 rounded-[48px] bg-smoke-200 px-8 py-10 shadow-enstore"
              >
                {/* Status Badge */}
                <div className="mb-6 font-medium">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs ${
                      isPaid
                        ? "border border-green-500/20 bg-green-500/10 text-green-500"
                        : isExpired
                          ? "border border-red-500/20 bg-red-500/10 text-red-500"
                          : "border border-yellow-500/20 bg-yellow-500/10 text-yellow-500"
                    }`}
                  >
                    <TimerRounded className="h-4! w-4!" />
                    <span className="capitalize">{transaction.status}</span>
                  </span>
                </div>

                {/* Product Info */}
                <div className="mb-8 flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full border-4 border-cloud-200">
                    <Image
                      src={
                        transaction.product.image || "/assets/placeholder.png"
                      }
                      alt={transaction.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="mb-1 text-2xl leading-tight font-bold text-brand-500/90">
                      {transaction.product.name}
                    </h2>
                    <p className="text-sm font-medium text-brand-500/40 lowercase first-letter:uppercase">
                      {transaction.product.item}
                    </p>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="border-t border-brand-500/5 py-6">
                  {Object.entries(transaction.product.customer_data || {}).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="mb-4 flex justify-between text-sm"
                      >
                        <span className="text-brand-500/40 lowercase first-letter:uppercase">
                          {key.replace("_", " ").toLowerCase()}
                        </span>
                        <span className="font-medium text-brand-500/90">
                          {value}
                        </span>
                      </div>
                    ),
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-brand-500/40">Transaction Id</span>
                    <span className="font-medium text-brand-500/90">
                      {transaction.transaction_code}
                    </span>
                  </div>
                </div>

                {/* Pricing breakdown */}
                <div className="border-t border-brand-500/5 py-6">
                  <div className="mb-4 flex justify-between text-sm">
                    <span className="text-brand-500/40">Subtotal</span>
                    <span className="font-medium text-brand-500/90">
                      Rp. {formatPrice(transaction.pricing.product)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-500/40">Admin Fee</span>
                    <span className="font-medium text-brand-500/90">
                      Rp. {formatPrice(transaction.pricing.admin)}
                    </span>
                  </div>
                </div>

                <div className="mb-2 border-t border-brand-500/5 py-6">
                  <div className="mb-4 flex justify-between text-sm">
                    <span className="text-[20px] font-bold text-brand-500/90">
                      Total Payment
                    </span>
                    <span className="text-2xl font-bold tracking-tight text-ocean-500">
                      Rp. {formatPrice(transaction.pricing.total)}
                    </span>
                  </div>
                </div>

                {!isPaid && !isExpired && (
                  <Button
                    variant="white"
                    onClick={handleCancelOrder}
                    className="w-full border border-ocean-500 text-ocean-500"
                  >
                    Cancel Order
                  </Button>
                )}
              </motion.div>

              {/* Expiry Banner */}
              {!isPaid && !isExpired && transaction.payment.expired_at && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-between rounded-full border border-ocean-500 bg-ocean-500/10 p-4 text-ocean-500"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <TimerRounded className="h-4! w-4!" />
                    <span>Payment expires in</span>
                  </div>
                  <span className="font-bold">
                    <CountdownTimer
                      targetDate={transaction.payment.expired_at}
                      onExpire={() => setIsTimeExpired(true)}
                    />
                  </span>
                </motion.div>
              )}

              {/* Success Details (SN/Note) */}
              {isPaid && (transaction.sn || transaction.note) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 rounded-[32px] border border-green-100 bg-green-50 p-6"
                >
                  {transaction.sn && (
                    <div>
                      <p className="mb-1 text-[10px] font-bold tracking-widest text-green-600/60 uppercase">
                        Serial Number / SN
                      </p>
                      <p className="font-mono font-bold break-all text-green-700">
                        {transaction.sn}
                      </p>
                    </div>
                  )}
                  {transaction.note && (
                    <div>
                      <p className="mb-1 text-[10px] font-bold tracking-widest text-green-600/60 uppercase">
                        Note
                      </p>
                      <p className="text-sm text-green-700">
                        {transaction.note}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Right Column: Payment Method Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="col-span-1 lg:col-span-2"
            >
              <div className="rounded-[48px] bg-smoke-200 px-8 py-10 shadow-enstore">
                <div className="flex flex-col items-center justify-center">
                  {/* Adaptive Header */}
                  <h3 className="mb-8 text-2xl font-bold text-brand-500/90">
                    {transaction.payment.qr_url
                      ? "Scan QR to Pay"
                      : "Complete Payment"}
                  </h3>
                  <p className="mb-10 text-brand-500/40">
                    {transaction.payment.qr_url
                      ? "Supports payments via Shopee Pay, OVO, DANA, GoPay, LinkAja, and bank transfers via QRIS."
                      : `Please follow the instructions below to complete your payment via ${transaction.payment.payment_method}.`}
                  </p>

                  {/* QRIS View */}
                  {transaction.payment.qr_url ? (
                    <>
                      <div className="mb-10 inline-block rounded-[40px] border border-brand-500/5 bg-cloud-200 p-10">
                        <div className="relative flex h-80 w-80 items-center justify-center overflow-hidden rounded-3xl border border-brand-500/5">
                          <Image
                            src={transaction.payment.qr_url}
                            alt="Payment QR"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <Button
                          onClick={() =>
                            handleDownloadQR(transaction.payment.qr_url || "")
                          }
                          variant="white"
                          className="border border-brand-500/5"
                          icon={<FileDownloadRounded />}
                        >
                          Download QR
                        </Button>
                      </div>
                    </>
                  ) : transaction.payment.payment_code ? (
                    <div className="w-full lg:max-w-10/12">
                      {/* VA / Payment Code View */}
                      <div className="mb-10 inline-block w-full rounded-[40px] border border-brand-500/5 bg-cloud-200 p-10">
                        <p className="mb-4 text-sm font-bold tracking-widest text-brand-500/40 uppercase">
                          Payment Code / VA Number
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-4xl font-bold tracking-wider text-brand-500/90">
                            {transaction.payment.payment_code}
                          </span>

                          <Button
                            onClick={() =>
                              handleCopy(transaction.payment.payment_code!)
                            }
                            variant="white"
                            className={`rounded-2xl! border border-brand-500/5 p-4 ${copied ? "border-ocean-500" : ""}`}
                            icon={
                              copied ? (
                                <CheckCircleRounded className="h-6! w-6! text-ocean-500" />
                              ) : (
                                <ContentCopyRounded className="h-6! w-6! text-brand-500" />
                              )
                            }
                            iconOnly={true}
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <p className="font-bold text-brand-500">How to pay:</p>
                        <Accordion
                          items={
                            transaction.payment.instructions?.map(
                              (section) => ({
                                title: section.title,
                                content: (
                                  <ul className="space-y-3">
                                    {section.steps.map((step, idx) => (
                                      <li
                                        key={idx}
                                        className="flex items-start gap-4 text-sm leading-relaxed text-brand-500/70"
                                      >
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ocean-500/10 text-[10px] font-bold text-ocean-500">
                                          {idx + 1}
                                        </span>
                                        <span
                                          dangerouslySetInnerHTML={{
                                            __html: step,
                                          }}
                                        />
                                      </li>
                                    ))}
                                  </ul>
                                ),
                              }),
                            ) || []
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="py-20 text-brand-500/40">
                      Waiting for payment details...
                    </div>
                  )}

                  <div className="mt-14 flex w-full items-center justify-between border-t border-brand-500/5 pt-6">
                    <p className="text-sm text-brand-500/40 italic">
                      Paid already? It might take 1-2 mins to sync.
                    </p>
                    <Button
                      variant="primary"
                      onClick={fetchStatus}
                      icon={<SyncRounded />}
                    >
                      Check Payment Status
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
