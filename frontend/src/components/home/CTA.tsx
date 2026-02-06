"use client";

import Button from "@/components/ui/Button";

export function CTA() {
  return (
    <section className="bg-smoke-50 py-20">
      <div className="container mx-auto px-4 lg:px-0">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-ocean-400 to-ocean-600 px-8 py-16 text-center shadow-2xl shadow-ocean-500/20 lg:px-20 lg:py-24">
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-80 w-80 translate-x-1/3 translate-y-1/3 rounded-full bg-ocean-300/30 blur-3xl" />

          <h2 className="relative mb-6 font-sans text-3xl font-extrabold text-white lg:text-5xl">
            Ready To Level Up?
          </h2>

          <p className="relative mx-auto mb-10 max-w-2xl text-lg text-ocean-50 lg:text-xl">
            Join thousands of users who trust EnTopUp for their daily gaming
            needs. Secure, fast, and reliable.
          </p>

          <div className="relative flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              variant="white"
              size="lg"
              className="w-full text-ocean-600 hover:bg-white/90 sm:w-auto"
            >
              Create Free Account
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="w-full bg-ocean-700/50 text-white backdrop-blur-sm hover:bg-ocean-700 sm:w-auto"
            >
              Download App
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
