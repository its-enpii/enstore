"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  RocketLaunchRounded,
  VerifiedRounded,
  AccessTimeRounded,
  EmailRounded,
  InfoRounded,
  KeyboardArrowRightRounded,
  SecurityRounded,
  SupportAgentRounded,
} from "@mui/icons-material";
import { motion } from "motion/react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// Mock data - in real app, fetch from API
const productData: Record<string, {
  title: string;
  publisher: string;
  image: string;
  currency: string;
  packages: { id: string; name: string; price: number }[];
}> = {
  "mobile-legends": {
    title: "Mobile Legends",
    publisher: "Moonton",
    image: "/assets/hero-image/mobile-legends.png",
    currency: "Diamonds",
    packages: [
      { id: "1", name: "5 Diamonds", price: 1447 },
      { id: "2", name: "50 Diamonds", price: 15809 },
      { id: "3", name: "170 Diamonds", price: 48440 },
      { id: "4", name: "450 Diamonds", price: 120012 },
      { id: "5", name: "601 Diamonds", price: 151578 },
      { id: "6", name: "750 Diamonds", price: 205001 },
      { id: "7", name: "965 Diamonds", price: 287401 },
      { id: "8", name: "1183 Diamonds", price: 325491 },
      { id: "9", name: "1412 Diamonds", price: 394138 },
    ],
  },
  "genshin-impact": {
    title: "Genshin Impact",
    publisher: "Hoyoverse",
    image: "/assets/hero-image/genshin-impact.png",
    currency: "Genesis Crystal",
    packages: [
      { id: "1", name: "60 Genesis Crystal", price: 16000 },
      { id: "2", name: "300 Genesis Crystal", price: 79000 },
      { id: "3", name: "980 Genesis Crystal", price: 249000 },
      { id: "4", name: "1980 Genesis Crystal", price: 479000 },
      { id: "5", name: "3280 Genesis Crystal", price: 799000 },
      { id: "6", name: "6480 Genesis Crystal", price: 1599000 },
    ],
  },
};

const paymentMethods = {
  wallets: [
    { id: "qris", name: "QRIS", description: "Dana, GoPay, OVO, LinkAja", fee: 1000 },
  ],
  virtualAccounts: [
    { id: "bca", name: "BCA Virtual Account", fee: 2000 },
    { id: "mandiri", name: "Mandiri VA", fee: 1000 },
  ],
};

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const product = productData[slug] || productData["mobile-legends"];

  const [userId, setUserId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>("qris");
  const [email, setEmail] = useState("");

  const selectedPkg = product.packages.find((p) => p.id === selectedPackage);
  const paymentFee =
    [...paymentMethods.wallets, ...paymentMethods.virtualAccounts].find(
      (p) => p.id === selectedPayment
    )?.fee || 0;
  const total = (selectedPkg?.price || 0) + paymentFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID").format(price);
  };

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
          <KeyboardArrowRightRounded className="text-brand-500/40" fontSize="small" />
          <span className="text-brand-500/40">{product.title}</span>
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
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-10">
                      <h3 className="mb-2 text-2xl font-bold text-cloud-200">
                        {product.title}
                      </h3>
                      <p className="text-sm text-cloud-200/70">{product.publisher}</p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-8">
                  {/* How to Top Up */}
                  <div className="mb-8 gap-4 flex items-start">
                    <InfoRounded className="text-ocean-500 text-[20px]" />
                    <div className="flex flex-col gap-2">
                      <h3 className="mb-4 font-bold text-brand-500/90">How to Top Up</h3>
                      
                      <ol className="space-y-2 text-sm text-brand-500/60 list-decimal ml-4">
                        <li>Enter your User ID and Zone ID</li>
                        <li>Example: 12345567 (1234)</li>
                        <li>Select the desired diamond amount</li>
                        <li>Complete the payment</li>
                        <li>The diamonds will be added to your {product.title} account</li>
                      </ol>
                    </div>
                  </div>

                  <div className="w-full h-px bg-brand-500/5 rounded-full mb-8"></div>

                  {/* Guarantee Badges */}
                  <div className="mb-8 gap-4 flex items-start">
                    <VerifiedRounded className="text-ocean-500 text-[20px]" />
                    <div className="flex flex-col gap-2">
                      <h3 className="mb-4 font-bold text-brand-500/90">EnStore Guarantee</h3>
                      
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
            {/* Step 1: Enter User ID */}
            <div className="mb-6 rounded-3xl border border-brand-500/5 bg-white p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ocean-500 text-sm font-bold text-white">
                  1
                </div>
                <h2 className="text-lg font-bold text-brand-500/90">Enter User ID</h2>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <Input
                  label="User ID"
                  type="text"
                  placeholder="12345"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  inputSize="sm"
                  fullWidth
                />
                <Input
                  label="Zone ID"
                  type="text"
                  placeholder="1234"
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  inputSize="sm"
                  icon={<InfoRounded fontSize="small" />}
                  iconPosition="right"
                  fullWidth
                />
              </div>

              <p className="flex items-start gap-2 text-xs text-brand-500/40">
                <InfoRounded style={{ fontSize: 14 }} className="mt-0.5 shrink-0" />
                To find your ID, open the game and tap your profile picture. Your ID will be displayed next to your name.
              </p>
            </div>

            {/* Step 2: Select Nominal */}
            <div className="mb-6 rounded-3xl border border-brand-500/5 bg-white p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ocean-500 text-sm font-bold text-white">
                  2
                </div>
                <h2 className="text-lg font-bold text-brand-500/90">Select Nominal</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {product.packages.map((pkg) => (
                  <motion.button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`relative rounded-2xl border-2 p-4 text-center transition-all duration-300 ${
                      selectedPackage === pkg.id
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
                    <p className="mb-1 text-sm font-bold text-brand-500/90">{pkg.name}</p>
                    <p className="text-xs text-brand-500/40">Rp. {formatPrice(pkg.price)}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="mb-6 rounded-3xl border border-brand-500/5 bg-white p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ocean-500 text-sm font-bold text-white">
                  3
                </div>
                <h2 className="text-lg font-bold text-brand-500/90">Payment Method</h2>
              </div>

              {/* Digital Wallets */}
              <div className="mb-4">
                <p className="mb-3 flex items-center gap-2 text-xs font-medium tracking-wide text-brand-500/40 uppercase">
                  <span className="h-1 w-1 rounded-full bg-brand-500/40" />
                  Digital Wallets
                </p>
                {paymentMethods.wallets.map((method) => (
                  <motion.button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`mb-2 w-full rounded-2xl border-2 p-4 text-left transition-all duration-300 ${
                      selectedPayment === method.id
                        ? "border-ocean-500 bg-ocean-500/5"
                        : "border-brand-500/5 bg-cloud-100 hover:border-ocean-500/30"
                    }`}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-pink-500">
                          <span className="text-lg font-bold text-white">Q</span>
                        </div>
                        <div>
                          <p className="font-medium text-brand-500/90">{method.name}</p>
                          <p className="text-xs text-brand-500/40">{method.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-brand-500/40">Fee</p>
                        <p className="font-medium text-ocean-500">
                          Rp. {formatPrice(method.fee)}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Virtual Accounts */}
              <div>
                <p className="mb-3 flex items-center gap-2 text-xs font-medium tracking-wide text-brand-500/40 uppercase">
                  <span className="h-1 w-1 rounded-full bg-brand-500/40" />
                  Virtual Accounts
                </p>
                {paymentMethods.virtualAccounts.map((method) => (
                  <motion.button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`mb-2 w-full rounded-2xl border-2 p-4 text-left transition-all duration-300 ${
                      selectedPayment === method.id
                        ? "border-ocean-500 bg-ocean-500/5"
                        : "border-brand-500/5 bg-cloud-100 hover:border-ocean-500/30"
                    }`}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white">
                          {method.id.toUpperCase().slice(0, 3)}
                        </div>
                        <p className="font-medium text-brand-500/90">{method.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-brand-500/40">Fee</p>
                        <p className="font-medium text-brand-500/90">
                          Rp. {formatPrice(method.fee)}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
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
                    disabled={!selectedPackage || !userId}
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
