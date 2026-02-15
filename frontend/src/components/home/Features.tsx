"use client";

import {
  RocketLaunchRounded,
  SecurityRounded,
  SupportAgentRounded,
} from "@mui/icons-material";
import { motion } from "motion/react";

const features = [
  {
    icon: <RocketLaunchRounded className="text-smoke-100" fontSize="large" />,
    title: "Instant Delivery",
    description:
      "Powered by real-time API connections. Your assets are credited immediately after payment verification. Zero waiting time.",
    color: "bg-ocean-500",
  },
  {
    icon: <SecurityRounded className="text-smoke-100" fontSize="large" />,
    title: "Secure Encryption",
    description:
      "Protected with 256-bit SSL encryption and verified payment gateways. We prioritize your data privacy and transaction safety.",
    color: "bg-brand-500",
  },
  {
    icon: <SupportAgentRounded className="text-ocean-500" fontSize="large" />,
    title: "Premium Support",
    description:
      "Our dedicated support team is ready to assist you via chat or email. Quick resolutions for every gamer.",
    color: "bg-cloud-300",
  },
];

export function Features() {
  return (
    <section className="bg-smoke-200 py-28">
      <div className="container mx-auto px-4 lg:px-0">
        <motion.div
          className="mb-10 text-center md:mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-4 font-sans text-2xl font-black text-brand-500 sm:text-3xl md:mb-6 lg:text-4xl">
            Why En<span className="text-ocean-500">Store</span>
          </h2>
          <p className="mx-auto max-w-xl text-sm font-bold text-brand-500/60 sm:text-base">
            We combine the reliability of a bank with the speed gamers need.
            Security and speed are our top priorities.
          </p>
        </motion.div>

        <div className="mb-6 grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="w-full"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                className="group relative h-full overflow-hidden rounded-[40px] bg-cloud-200 p-8 border border-brand-500/5 transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <motion.div
                  className={`mb-8 w-fit rounded-2xl p-4 [&>svg]:h-8 [&>svg]:w-8 ${feature.color}`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="mb-4 text-2xl font-black text-brand-500">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-brand-500/50 sm:text-base">
                  {feature.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
