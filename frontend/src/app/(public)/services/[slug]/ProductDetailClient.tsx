"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  RocketLaunchRounded,
  VerifiedRounded,
  EmailRounded,
  InfoRounded,
  SecurityRounded,
  SupportAgentRounded,
  ShoppingCartCheckoutRounded,
} from "@mui/icons-material";
import { motion } from "motion/react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  getProductBySlug,
  getPaymentChannels,
  guestPurchase,
  type Product,
  type PaymentChannel,
} from "@/lib/api";
import ItemCard from "@/components/services/ItemCard";
import Breadcrumb from "@/components/services/breadcrumb";
import { toast } from "react-hot-toast";

export default function ProductDetailPage({
  slug: propSlug,
}: {
  slug?: string;
}) {
  const params = useParams();
  const slug = propSlug || (params?.slug as string);

  const router = useRouter();

  // API States
  const [product, setProduct] = useState<Product | null>(null);
  const [paymentChannelList, setPaymentChannelList] = useState<
    PaymentChannel[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>("QRIS");
  const [email, setEmail] = useState("");

  const handlePurchase = async () => {
    if (!selectedPackage || !selectedPayment || !product) {
      toast.error("Please select a package and payment method.");
      return;
    }

    // Validate required fields
    if (product.input_fields) {
      const missingFields = product.input_fields.filter(
        (f) => f.required && !formData[f.name],
      );
      if (missingFields.length > 0) {
        toast.error(
          `Please fill in: ${missingFields.map((f) => f.label).join(", ")}`,
        );
        return;
      }
    }

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await guestPurchase({
        product_item_id: selectedPackage,
        payment_method: selectedPayment,
        customer_data: formData,
        customer_email: email,
      });

      if (response.success && response.data) {
        // Redirect to payment page
        router.push(
          `/services/${slug}/payment?transactionCode=${response.data.transaction.transaction_code}`,
        );
      } else {
        toast.error(response.message || "Failed to create transaction");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch product data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [productRes, channelsRes] = await Promise.all([
          getProductBySlug(slug),
          getPaymentChannels(),
        ]);

        if (productRes.success) {
          setProduct(productRes.data);
        } else {
          setError("Product not found");
        }

        if (channelsRes.success) {
          setPaymentChannelList(channelsRes.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Gagal memuat produk. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  // Helpers
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const selectedItem = product?.items?.find((i) => i.id === selectedPackage);
  const selectedChannel = paymentChannelList.find(
    (c) => c.code === selectedPayment,
  );

  // Helper to calculate fee for a specific channel
  const getChannelFee = (channel: PaymentChannel) => {
    let fee = channel.total_fee.flat;
    if (channel.total_fee.percent > 0) {
      fee += (channel.total_fee.percent / 100) * (selectedItem?.price || 0);
    }
    return fee;
  };

  const selectedChannelFee = selectedChannel
    ? getChannelFee(selectedChannel)
    : 0;
  const total = (selectedItem?.price || 0) + selectedChannelFee;

  // Group payment channels
  const groupedChannels = paymentChannelList.reduce(
    (acc, channel) => {
      const group = channel.group || "Other";
      if (!acc[group]) acc[group] = [];
      acc[group].push(channel);
      return acc;
    },
    {} as Record<string, PaymentChannel[]>,
  );

  // Loading state
  if (loading) {
    return (
      <section className="bg-cloud-200 pt-16 pb-[88px]">
        <div className="container mx-auto flex items-center justify-center px-4 py-40">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-ocean-500/20 border-t-ocean-500" />
        </div>
      </section>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <section className="bg-cloud-200 pt-16 pb-[88px]">
        <div className="container mx-auto px-4 py-40 text-center">
          <p className="mb-4 text-lg text-red-500/70">
            {error || "Product not found"}
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-cloud-200 pt-16 pb-[88px]">
      <div className="container mx-auto px-4 lg:px-0">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Service", href: "/services" },
            { label: product.name },
          ]}
        />

        <div className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3">
          {/* Left Side - Sticky on Desktop */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="lg:sticky lg:top-28">
              <div className="rounded-[48px] bg-smoke-200 p-4 shadow-enstore">
                {/* Game Card */}
                <div className="relative overflow-hidden rounded-4xl">
                  <div className="relative h-72 w-full">
                    <Image
                      src={
                        product.image || "/assets/hero-image/mobile-legends.png"
                      }
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute right-0 bottom-0 left-0 p-10">
                      <h3 className="mb-2 text-2xl font-bold text-cloud-200">
                        {product.name}
                      </h3>
                      <p className="text-sm text-cloud-200/70">
                        {product.provider || product.brand}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-6 md:px-6 md:py-8">
                  {/* How to Top Up */}
                  <div className="mb-8 flex items-start gap-4">
                    <InfoRounded className="text-[20px] text-ocean-500" />
                    <div className="flex flex-col gap-4">
                      <h3 className="font-bold text-brand-500/90">
                        How to Top Up
                      </h3>

                      <ol className="ml-4 list-decimal space-y-2 text-sm text-brand-500/60">
                        {product.input_fields &&
                        product.input_fields.length > 0 ? (
                          <>
                            <li>
                              Enter your{" "}
                              {product.input_fields
                                .map((f) => f.label)
                                .join(" and ")}
                            </li>
                            <li>
                              Select the desired{" "}
                              {product.type === "game" ? "package" : "nominal"}
                            </li>
                            <li>Complete the payment</li>
                            <li>
                              Your order will be processed instantly to your{" "}
                              {product.name} account
                            </li>
                          </>
                        ) : (
                          <>
                            <li>Select the desired nominal</li>
                            <li>Complete the payment</li>
                            <li>Your order will be processed instantly</li>
                          </>
                        )}
                      </ol>
                    </div>
                  </div>

                  {/* Guarantee Badges */}
                  <div className="mb-8 flex items-start gap-4">
                    <VerifiedRounded className="text-[20px] text-ocean-500" />
                    <div className="flex flex-col gap-4">
                      <h3 className="font-bold text-brand-500/90">
                        EnStore Guarantee
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-2 rounded-xl border border-ocean-500/20 bg-ocean-500/10 px-3 py-2 text-xs font-medium text-ocean-500">
                          <RocketLaunchRounded className="text-base" />
                          Instant
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs font-medium text-green-600">
                          <SecurityRounded className="text-base" />
                          Secure
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-xs font-medium text-purple-600">
                          <SupportAgentRounded className="text-base" />
                          24/7
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Main Content */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Step 1: Enter User Data (Dynamic from input_fields) */}
            {product.input_fields && product.input_fields.length > 0 && (
              <div className="mb-8 rounded-[48px] bg-smoke-200 px-6 py-8 shadow-enstore md:px-8 md:py-10">
                <div className="mb-6 flex items-center gap-3 md:mb-10">
                  <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-ocean-500 text-[20px] font-bold text-white">
                    1
                  </div>
                  <h2 className="text-[20px] font-bold text-brand-500/90">
                    Enter Your Information
                  </h2>
                </div>

                <div
                  className={`mb-8 grid gap-x-6 gap-y-8 ${product.input_fields.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}
                >
                  {product.input_fields.map((field) => {
                    if (field.type === "select" && field.options) {
                      const options = field.options
                        .split(",")
                        .map((o) => o.trim());
                      return (
                        <div key={field.name} className="w-full">
                          <div className="mb-1.5 block text-sm font-medium text-gray-700">
                            {field.label}{" "}
                            {field.required && (
                              <span className="text-red-500">*</span>
                            )}
                          </div>
                          <div className="relative">
                            <select
                              className="w-full appearance-none rounded-full border-0 bg-cloud-200 px-6 py-4 text-base text-brand-500/60 transition-all duration-200 placeholder:text-brand-500/30 focus:border-ocean-500 focus:ring-1 focus:ring-ocean-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                              value={formData[field.name] || ""}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  [field.name]: e.target.value,
                                }))
                              }
                            >
                              <option value="">Select {field.label}</option>
                              {options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-6 text-brand-500/40">
                              <svg
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <Input
                        key={field.name}
                        label={field.label}
                        type={field.type || "text"}
                        placeholder={field.placeholder || field.label}
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            [field.name]: e.target.value,
                          }))
                        }
                        inputSize="md"
                        fullWidth
                      />
                    );
                  })}
                </div>

                <p className="flex items-center gap-2 rounded-full border border-brand-500/5 bg-cloud-200 p-3 text-sm text-brand-500/50">
                  <InfoRounded className="h-4 w-4 shrink-0 text-ocean-500" />
                  {product.description ||
                    `Enter the required information for your ${product.name} account.`}
                </p>
              </div>
            )}

            {/* Step 2: Select Nominal */}
            <div className="mb-8 rounded-[48px] bg-smoke-200 px-6 py-8 shadow-enstore md:px-8 md:py-10">
              <div className="mb-6 flex items-center gap-3 md:mb-10">
                <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-ocean-500 text-[20px] font-bold text-white">
                  {product.input_fields && product.input_fields.length > 0
                    ? 2
                    : 1}
                </div>
                <h2 className="text-[20px] font-bold text-brand-500/90">
                  Select Nominal
                </h2>
              </div>

              {(() => {
                // Group items
                const activeItems =
                  product.items?.filter(
                    (item) =>
                      item.is_active && item.stock_status === "available",
                  ) || [];

                // Get unique groups, preserving order if possible (or just sort)
                const groups = Array.from(
                  new Set(activeItems.map((i) => i.group || "Other")),
                );
                const hasGroups =
                  groups.length > 1 ||
                  (groups.length === 1 && groups[0] !== "Other");

                return (
                  <div className="space-y-8">
                    {hasGroups ? (
                      groups.map((group) => {
                        const groupItems = activeItems.filter(
                          (i) => (i.group || "Other") === group,
                        );
                        if (groupItems.length === 0) return null;

                        return (
                          <div key={group}>
                            <h3 className="mb-4 text-lg font-bold text-brand-500/80 capitalize">
                              {group}
                            </h3>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
                              {groupItems.map((item) => (
                                <ItemCard
                                  key={item.id}
                                  item={item}
                                  selectedPackage={selectedPackage}
                                  setSelectedPackage={setSelectedPackage}
                                  formatPrice={formatPrice}
                                  icon={product.icon}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
                        {activeItems.map((item) => (
                          <ItemCard
                            key={item.id}
                            item={item}
                            selectedPackage={selectedPackage}
                            setSelectedPackage={setSelectedPackage}
                            formatPrice={formatPrice}
                            icon={product.icon}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {(!product.items || product.items.length === 0) && (
                <p className="py-8 text-center text-brand-500/40">
                  No packages available for this product.
                </p>
              )}
            </div>

            {/* Step 3: Payment Method */}
            <div className="mb-8 rounded-[48px] bg-smoke-200 px-6 py-8 shadow-enstore md:px-8 md:py-10">
              <div className="mb-6 flex items-center gap-3 md:mb-10">
                <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-ocean-500 text-[20px] font-bold text-white">
                  3
                </div>
                <h2 className="text-[20px] font-bold text-brand-500/90">
                  Payment Method
                </h2>
              </div>

              {/* Payment Channels from API */}
              {Object.entries(groupedChannels).map(
                ([group, channels], index) => (
                  <div key={group} className={index > 0 ? "mt-6 md:mt-8" : ""}>
                    <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-brand-500/40 uppercase md:text-sm">
                      <span className="h-2 w-2 rounded-full bg-brand-500/40" />
                      {group}
                    </p>
                    {channels
                      .filter((c) => c.active)
                      .map((channel) => (
                        <motion.button
                          key={channel.code}
                          onClick={() => setSelectedPayment(channel.code)}
                          className={`mt-2 w-full rounded-3xl border-2 p-4 text-left transition-all duration-300 md:mt-4 ${
                            selectedPayment === channel.code
                              ? "border-ocean-500 bg-ocean-500/5"
                              : "border-brand-500/5 bg-smoke-200 hover:border-ocean-500/30"
                          }`}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 md:gap-3">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 md:h-12 md:w-12 md:rounded-2xl ${
                                  selectedPayment === channel.code
                                    ? "bg-ocean-500"
                                    : "bg-cloud-200"
                                }`}
                              >
                                <span
                                  className={`text-xs font-bold transition-all duration-300 md:text-sm ${
                                    selectedPayment === channel.code
                                      ? "text-cloud-200"
                                      : "text-ocean-500"
                                  }`}
                                >
                                  {channel.code.slice(0, 3)}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-brand-500/90 md:text-base">
                                {channel.name
                                  .replace("Virtual Account", "VA")
                                  .replace("(Customizable)", "")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-brand-500/40">Fee</p>
                              <p className="text-sm font-medium text-ocean-500 md:text-base">
                                Rp. {formatPrice(getChannelFee(channel))}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                  </div>
                ),
              )}

              {/* Fallback if no payment channels */}
              {paymentChannelList.length === 0 && (
                <p className="py-4 text-center text-brand-500/40">
                  Payment channels are being loaded...
                </p>
              )}
            </div>

            {/* Checkout Bar */}
            <motion.div
              className="rounded-[48px] bg-smoke-200 px-6 py-8 shadow-enstore md:px-8 md:py-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                <div>
                  <Input
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    inputSize="md"
                    icon={<EmailRounded />}
                    iconPosition="left"
                    fullWidth={true}
                  />
                  <p className="mt-2 text-left text-xs text-brand-500/40">
                    Receipt & order updates will be sent here
                  </p>
                </div>

                <div className="flex items-center justify-between gap-6 md:justify-end">
                  <div className="text-right">
                    <p className="mb-2 text-xs font-medium text-brand-500/40 uppercase">
                      Total
                    </p>
                    <p className="text-base font-bold text-ocean-500 md:text-xl">
                      Rp. {formatPrice(total)}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    disabled={
                      !selectedPackage ||
                      submitting ||
                      (product.input_fields != null &&
                        product.input_fields.length > 0 &&
                        product.input_fields.some(
                          (f) => f.required && !formData[f.name],
                        ))
                    }
                    onClick={handlePurchase}
                    icon={
                      submitting ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      ) : (
                        <ShoppingCartCheckoutRounded className="h-5 w-5" />
                      )
                    }
                  >
                    {submitting ? "Processing..." : "Pay Now"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
