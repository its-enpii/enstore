"use client";

import Button from "@/components/ui/Button";
import { motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export function CTA() {
  const { user, isAuthenticated } = useAuth();

  const getDashboardHref = () => {
    if (!user) return "/dashboard";
    if (user.role === 'admin') return "/admin/dashboard";
    if (user.customer_type === 'reseller') return "/reseller/dashboard";
    return "/dashboard";
  };

  return (
    <section className="bg-cloud-200 py-28 pt-0">
      <div className="container mx-auto px-4 lg:px-0">
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-ocean-500 px-6 py-12 text-center sm:rounded-[2.5rem] sm:px-8 sm:py-16 lg:px-20 lg:py-24"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative circles */}
          <motion.div
            className="absolute top-0 left-0 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-br from-ocean-600 to-ocean-400 opacity-20 sm:h-[325px] sm:w-[325px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.25, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute right-0 bottom-0 h-[250px] w-[250px] translate-x-1/3 translate-y-1/3 rounded-full bg-linear-to-br from-ocean-400 to-ocean-600 opacity-20 sm:h-[426px] sm:w-[426px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.25, 0.2] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />

          <motion.h2
            className="relative mb-4 font-sans text-2xl font-bold text-smoke-100 sm:mb-6 sm:text-3xl lg:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {isAuthenticated ? "Welcome Back, Chief!" : "Ready To Level Up?"}
          </motion.h2>

          <motion.p
            className="relative mx-auto mb-8 max-w-2xl text-sm text-smoke-100/70 sm:mb-10 sm:text-base"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {isAuthenticated 
              ? "Your dashboard is waiting. Check your recent transactions or top up your favorite games now."
              : "Join thousands of users who trust EnStore for their daily gaming needs. Secure, fast, and reliable."}
          </motion.p>

          <motion.div
            className="relative flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {isAuthenticated ? (
                <Link href={getDashboardHref()}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="white"
                            className="w-full text-ocean-600 hover:bg-smoke-300 active:bg-smoke-400 sm:w-auto px-8"
                        >
                            Go to Dashboard
                        </Button>
                    </motion.div>
                </Link>
            ) : (
                <>
                    <Link href="/register">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                variant="white"
                                className="w-full text-ocean-600 hover:bg-smoke-300 active:bg-smoke-400 sm:w-auto"
                            >
                                Create Free Account
                            </Button>
                        </motion.div>
                    </Link>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="dark"
                            className="w-full border border-cloud-200/20 bg-brand-500/10! text-smoke-100 backdrop-blur-sm hover:bg-brand-500/20 active:bg-brand-500/30 sm:w-auto"
                        >
                            Download App
                        </Button>
                    </motion.div>
                </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
