"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  RocketLaunchRounded,
  VerifiedRounded,
  EmailRounded,
  InfoRounded,
  KeyboardArrowRightRounded,
  SecurityRounded,
  SupportAgentRounded,
} from "@mui/icons-material";
import { motion } from "motion/react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  getProductBySlug,
  getPaymentChannels,
  type Product,
  type PaymentChannel,
} from "@/lib/api";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  // API States
  const [product, setProduct] = useState<Product | null>(null);
  const [paymentChannelList, setPaymentChannelList] = useState<
    PaymentChannel[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>("QRIS");
  const [email, setEmail] = useState("");

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
    return new Intl.NumberFormat("id-ID").format(price);
  };

  const selectedItem = product?.items?.find((i) => i.id === selectedPackage);
  const selectedChannel = paymentChannelList.find(
    (c) => c.code === selectedPayment,
  );
  const paymentFee = selectedChannel?.fee_customer?.flat || 0;
  const total = (selectedItem?.price || 0) + paymentFee;

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
        <motion.div
          className="mb-12 p-2 flex items-center gap-2 text-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-ocean-500">Service</span>
          <KeyboardArrowRightRounded
            className="text-brand-500/40"
            fontSize="small"
          />
          <span className="text-brand-500/40">{product.name}</span>
        </motion.div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Side - Sticky on Desktop */}
          <motion.div
            className="w-full lg:w-4/12"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="lg:sticky lg:top-28">
              <div className="rounded-[48px] bg-smoke-200 shadow-enstore p-4">
                {/* Game Card */}
                <div className="relative overflow-hidden rounded-4xl">
                  <div className="relative h-72 w-full">
                    <Image
                      src={
                        product.image ||
                        "/assets/hero-image/mobile-legends.png"
                      }
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-10">
                      <h3 className="mb-2 text-2xl font-bold text-cloud-200">
                        {product.name}
                      </h3>
                      <p className="text-sm text-cloud-200/70">
                        {product.provider || product.brand}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-8">
                  {/* How to Top Up */}
                  <div className="mb-8 gap-4 flex items-start">
                    <InfoRounded className="text-ocean-500 text-[20px]" />
                    <div className="flex flex-col gap-2">
                      <h3 className="mb-4 font-bold text-brand-500/90">
                        How to Top Up
                      </h3>

                      <ol className="space-y-2 text-sm text-brand-500/60 list-decimal ml-4">
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

                  <div className="w-full h-px bg-brand-500/5 rounded-full mb-8"></div>

                  {/* Guarantee Badges */}
                  <div className="mb-8 gap-4 flex items-start">
                    <VerifiedRounded className="text-ocean-500 text-[20px]" />
                    <div className="flex flex-col gap-2">
                      <h3 className="mb-4 font-bold text-brand-500/90">
                        EnStore Guarantee
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-ocean-500/10 border border-ocean-500/20 px-3 py-2 text-xs font-medium text-ocean-500">
                          <RocketLaunchRounded className="text-base" />
                          Instant
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-green-500/10 border border-green-500/20 px-3 py-2 text-xs font-medium text-green-600">
                          <SecurityRounded className="text-base" />
                          Secure
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-2 text-xs font-medium text-purple-600">
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
            className="w-full lg:w-8/12"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Step 1: Enter User Data (Dynamic from input_fields) */}
            {product.input_fields && product.input_fields.length > 0 && (
              <div className="mb-6 rounded-3xl border border-brand-500/5 bg-white p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ocean-500 text-sm font-bold text-white">
                    1
                  </div>
                  <h2 className="text-lg font-bold text-brand-500/90">
                    Enter Your Information
                  </h2>
                </div>

                <div
                  className={`mb-4 grid gap-4 ${product.input_fields.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
                >
                  {product.input_fields.map((field) => (
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
                      inputSize="sm"
                      fullWidth
                    />
                  ))}
                </div>

                <p className="flex items-start gap-2 text-xs text-brand-500/40">
                  <InfoRounded
                    style={{ fontSize: 14 }}
                    className="mt-0.5 shrink-0"
                  />
                  {product.description ||
                    `Enter the required information for your ${product.name} account.`}
                </p>
              </div>
            )}

            {/* Step 2: Select Nominal */}
            <div className="mb-6 rounded-3xl border border-brand-500/5 bg-white p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ocean-500 text-sm font-bold text-white">
                  {product.input_fields && product.input_fields.length > 0
                    ? 2
                    : 1}
                </div>
                <h2 className="text-lg font-bold text-brand-500/90">
                  Select Nominal
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {product.items
                  ?.filter(
                    (item) =>
                      item.is_active && item.stock_status === "available",
                  )
                  .map((item) => (
                    <motion.button
                      key={item.id}
                      onClick={() => setSelectedPackage(item.id)}
                      className={`relative rounded-2xl border-2 p-4 text-center transition-all duration-300 ${
                        selectedPackage === item.id
                          ? "border-ocean-500 bg-ocean-500/5"
                          : "border-brand-500/5 bg-cloud-100 hover:border-ocean-500/30"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="mb-2 flex justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ocean-500/10">
                          <span className="text-xl">💎</span>
                        </div>
                      </div>
                      <p className="mb-1 text-sm font-bold text-brand-500/90">
                        {item.name}
                      </p>
                      <p className="text-xs text-brand-500/40">
                        Rp. {formatPrice(item.price)}
                      </p>
                    </motion.button>
                  ))}
              </div>

              {(!product.items || product.items.length === 0) && (
                <p className="text-center text-brand-500/40 py-8">
                  No packages available for this product.
                </p>
              )}
            </div>

            {/* Step 3: Payment Method */}
            <div className="mb-6 rounded-3xl border border-brand-500/5 bg-white p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ocean-500 text-sm font-bold text-white">
                  {product.input_fields && product.input_fields.length > 0
                    ? 3
                    : 2}
                </div>
                <h2 className="text-lg font-bold text-brand-500/90">
                  Payment Method
                </h2>
              </div>

              {/* Payment Channels from API */}
              {Object.entries(groupedChannels).map(([group, channels]) => (
                <div key={group} className="mb-4">
                  <p className="mb-3 flex items-center gap-2 text-xs font-medium tracking-wide text-brand-500/40 uppercase">
                    <span className="h-1 w-1 rounded-full bg-brand-500/40" />
                    {group}
                  </p>
                  {channels
                    .filter((c) => c.active)
                    .map((channel) => (
                      <motion.button
                        key={channel.code}
                        onClick={() => setSelectedPayment(channel.code)}
                        className={`mb-2 w-full rounded-2xl border-2 p-4 text-left transition-all duration-300 ${
                          selectedPayment === channel.code
                            ? "border-ocean-500 bg-ocean-500/5"
                            : "border-brand-500/5 bg-cloud-100 hover:border-ocean-500/30"
                        }`}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-pink-500">
                              <span className="text-xs font-bold text-white">
                                {channel.code.slice(0, 3)}
                              </span>
                            </div>
                            <p className="font-medium text-brand-500/90">
                              {channel.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-brand-500/40">Fee</p>
                            <p className="font-medium text-ocean-500">
                              Rp.{" "}
                              {formatPrice(channel.fee_customer?.flat || 0)}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                </div>
              ))}

              {/* Fallback if no payment channels */}
              {paymentChannelList.length === 0 && (
                <p className="text-center text-brand-500/40 py-4">
                  Payment channels are being loaded...
                </p>
              )}
            </div>

            {/* Checkout Bar */}
            <motion.div
              className="rounded-3xl border border-brand-500/5 bg-white p-4 sm:p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  inputSize="sm"
                  icon={<EmailRounded />}
                  iconPosition="left"
                />

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-brand-500/40 uppercase">Total</p>
                    <p className="text-xl font-bold text-ocean-500">
                      Rp. {formatPrice(total)}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={
                      !selectedPackage ||
                      (product.input_fields != null &&
                        product.input_fields.length > 0 &&
                        product.input_fields.some(
                          (f) => f.required && !formData[f.name],
                        ))
                    }
                    className="whitespace-nowrap"
                  >
                    💳 Pay Now
                  </Button>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-brand-500/40 sm:text-left">
                Receipt & order updates will be sent here
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
