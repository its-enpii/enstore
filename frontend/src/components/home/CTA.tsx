"use client";

import Button from "@/components/ui/Button";
import { motion } from "motion/react";

export function CTA() {
  return (
    <section className="bg-cloud-200 py-28">
      <div className="container mx-auto px-4 lg:px-0">
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-ocean-500 px-6 py-12 text-center shadow-2xl shadow-ocean-500/20 sm:rounded-[2.5rem] sm:px-8 sm:py-16 lg:px-20 lg:py-24"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative circles */}
          <motion.div
            className="absolute top-0 left-0 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-br from-ocean-500 to-smoke-200 opacity-10 sm:h-[325px] sm:w-[325px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute right-0 bottom-0 h-[250px] w-[250px] translate-x-1/3 translate-y-1/3 rounded-full bg-linear-to-br from-smoke-200 to-ocean-500 opacity-10 sm:h-[426px] sm:w-[426px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />

          <motion.h2
            className="relative mb-4 font-sans text-2xl font-bold text-white sm:mb-6 sm:text-3xl lg:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Ready To Level Up?
          </motion.h2>

          <motion.p
            className="relative mx-auto mb-8 max-w-2xl text-sm text-cloud-200 sm:mb-10 sm:text-base"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Join thousands of users who trust EnStore for their daily gaming
            needs. Secure, fast, and reliable.
          </motion.p>

          <motion.div
            className="relative flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="white"
                size="lg"
                className="w-full text-ocean-500 hover:bg-cloud-200/90 active:bg-cloud-200/30 sm:w-auto"
              >
                Create Free Account
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="dark"
                size="lg"
                className="w-full bg-brand-500/10! border border-cloud-200/20 text-cloud-200 backdrop-blur-sm hover:bg-brand-500/20 active:bg-brand-500/30 sm:w-auto"
              >
                Download App
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
