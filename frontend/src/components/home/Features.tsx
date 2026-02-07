"use client";

import {
  BoltRounded,
  ShieldRounded,
  SupportAgentRounded,
} from "@mui/icons-material";

const features = [
  {
    icon: <BoltRounded className="text-white" fontSize="large" />,
    title: "Instant Delivery",
    description:
      "Powered by real-time API connections. Your assets are credited immediately after payment verification. Zero waiting time.",
    color: "bg-ocean-500",
  },
  {
    icon: <ShieldRounded className="text-white" fontSize="large" />,
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
    color: "bg-ocean-50",
    iconColor: "text-ocean-500",
  },
];

export function Features() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4 lg:px-0">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-sans text-3xl font-bold text-brand-500/90 lg:text-4xl">
            Why EnTopUp
          </h2>
          <p className="mx-auto max-w-xl text-brand-500/40">
            We combine the reliability of a bank with the speed gamers need.
            Security and speed are our top priorities.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-3xl bg-smoke-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ocean-500/5"
            >
              <div
                className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${feature.color}`}
              >
                {feature.icon}
              </div>
              <h3 className="mb-3 text-xl font-bold text-brand-500">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-brand-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
