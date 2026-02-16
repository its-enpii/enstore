"use client";

import {
  RocketLaunchRounded,
  SecurityRounded,
  SupportAgentRounded,
} from "@mui/icons-material";
import { motion } from "motion/react";

const features = [
  {
    icon: <RocketLaunchRounded className="text-white" fontSize="large" />,
    title: "Instant Delivery",
    description:
      "Powered by real-time API connections. Your assets are credited immediately after payment verification. Zero waiting time.",
    color: "bg-ocean-500",
  },
  {
    icon: <SecurityRounded className="text-white" fontSize="large" />,
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
    color: "bg-smoke-200",
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
          <h2 className="mb-4 font-sans text-2xl font-bold text-brand-500/90 sm:text-3xl md:mb-6 lg:text-4xl">
            Why EnStore
          </h2>
          <p className="mx-auto max-w-xl text-sm text-brand-500/40 sm:text-base">
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
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <motion.div
                className="group relative h-full overflow-hidden rounded-3xl bg-cloud-200 p-6 transition-shadow duration-300 hover:shadow-xl hover:shadow-ocean-500/5 sm:rounded-xl sm:p-8"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className={`mb-6 w-fit rounded-xl p-3 sm:mb-8 sm:rounded-2xl sm:p-4 [&>svg]:h-6 [&>svg]:w-6 sm:[&>svg]:h-8 sm:[&>svg]:w-8 ${feature.color}`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="mb-3 text-xl font-bold text-brand-500/90 sm:mb-4 sm:text-2xl">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-brand-500/40 sm:text-base">
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
