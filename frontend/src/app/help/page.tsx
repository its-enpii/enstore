"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AddRounded,
  RemoveRounded,
  ChatBubbleRounded,
  WhatsApp, // Note: MUI might not have WhatsApp directly in all versions, checking if we need a workaround or if it exists. Usually it does or we use a similar icon.
  // Actually, let's use standard MUI icons that are likely available.
  SupportAgentRounded,
  EmailRounded,
  Telegram,
  SendRounded,
  AccessTimeFilledRounded,
} from "@mui/icons-material";
import Button from "@/components/ui/Button";

// FAQ Data
const faqs = [
  {
    question: "How long does a top-up take?",
    answer:
      "Most top-ups are processed instantly. In some rare cases depending on the network provider, it may take up to 30 minutes to reflect in the recipient's balance.",
  },
  {
    question: "Can I get a refund for a wrong number?",
    answer:
      "Unfortunately, top-ups sent to a wrong number cannot be refunded as the transaction is processed immediately by the provider. Please double-check the number before confirming payment.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept various payment methods including Bank Transfer (BCA, Mandiri, BRI, BNI), E-Wallets (GoPay, OVO, Dana, ShopeePay), and QRIS.",
  },
  {
    question: "Is there a limit on daily transactions?",
    answer:
      "There is no specific limit on the number of transactions you can make, but some payment methods may have their own daily transaction limits.",
  },
];

export default function HelpPage() {
  // FAQ State
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Form State
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      // Reset form usually, or just show success message
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-cloud-200 pt-32 pb-20">
      {/* Header Section */}
      <div className="container mx-auto px-4 lg:px-0">
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-brand-500/90 lg:text-5xl">
            Frequently Asked <span className="text-ocean-500">Questions</span>
          </h1>
          <p className="text-lg text-brand-500/40">
            Find quick answers to common questions about top-ups, accounts, and
            security.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="mx-auto mb-32 max-w-3xl space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-brand-500/5 transition-all duration-300 hover:shadow-ocean-500/10"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="flex w-full items-center justify-between p-6 text-left focus:outline-none sm:p-8"
              >
                <span className="pr-8 text-lg font-bold text-brand-500/90">
                  {faq.question}
                </span>
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${openIndex === index ? "bg-ocean-500 text-white" : "bg-cloud-200 text-brand-500/30"}`}
                >
                  {openIndex === index ? <RemoveRounded /> : <AddRounded />}
                </span>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-8 leading-relaxed text-brand-500/60 sm:px-8">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mx-auto max-w-6xl rounded-[48px] bg-white p-6 shadow-2xl shadow-brand-500/5 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left Column: Contact Info */}
            <div>
              <h2 className="mb-4 text-3xl font-bold text-brand-500/90">
                Contact Us
              </h2>
              <p className="mb-8 text-brand-500/40">
                Fill out the form and our specialized support team will get back
                to you shortly.
              </p>

              <div className="space-y-4">
                {/* Live Chat */}
                <div className="flex items-center gap-4 rounded-3xl border border-ocean-100 bg-ocean-50 p-6 transition-colors hover:border-ocean-200">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ocean-500 text-white shadow-lg shadow-ocean-500/20">
                    <ChatBubbleRounded fontSize="medium" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-500/90">Live Chat</h3>
                    <p className="text-sm font-medium text-ocean-500">
                      Wait time {"<"} 2 mins
                    </p>
                  </div>
                </div>

                {/* WhatsApp Support */}
                <div className="flex items-center gap-4 rounded-3xl border border-green-100 bg-green-50 p-6 transition-colors hover:border-green-200">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500 text-white shadow-lg shadow-green-500/20">
                    <WhatsApp fontSize="medium" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-500/90">
                      WhatsApp Support
                    </h3>
                    <p className="text-sm font-medium text-green-600">
                      Wait time {"<"} 5 mins
                    </p>
                  </div>
                </div>
              </div>

              {/* Office Hours */}
              <div className="mt-12 rounded-3xl bg-cloud-100 p-8">
                <div className="mb-4 flex items-center gap-2 text-brand-500/30">
                  <AccessTimeFilledRounded fontSize="small" />
                  <span className="text-xs font-bold tracking-widest uppercase">
                    Office Hours
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-500/60">Mon - Fri</span>
                    <span className="font-bold text-brand-500/90">
                      9:00 AM - 6:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-500/60">Sat - Sun</span>
                    <span className="font-bold text-brand-500/90">
                      10:00 AM - 2:00 PM
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-brand-500/90">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="rounded-2xl border border-brand-500/10 bg-cloud-50 px-5 py-4 font-medium text-brand-500 transition-all placeholder:text-brand-500/30 focus:border-ocean-500 focus:bg-white focus:ring-4 focus:ring-ocean-500/10 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-brand-500/90">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="john@gmail.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="rounded-2xl border border-brand-500/10 bg-cloud-50 px-5 py-4 font-medium text-brand-500 transition-all placeholder:text-brand-500/30 focus:border-ocean-500 focus:bg-white focus:ring-4 focus:ring-ocean-500/10 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-brand-500/90">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="How can we help?"
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    className="rounded-2xl border border-brand-500/10 bg-cloud-50 px-5 py-4 font-medium text-brand-500 transition-all placeholder:text-brand-500/30 focus:border-ocean-500 focus:bg-white focus:ring-4 focus:ring-ocean-500/10 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-brand-500/90">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Please describe your issue in detail..."
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    className="resize-none rounded-2xl border border-brand-500/10 bg-cloud-50 px-5 py-4 font-medium text-brand-500 transition-all placeholder:text-brand-500/30 focus:border-ocean-500 focus:bg-white focus:ring-4 focus:ring-ocean-500/10 focus:outline-none"
                  />
                </div>

                <Button
                  variant="primary"
                  className="mt-2 w-full rounded-2xl py-4 shadow-lg shadow-ocean-500/20"
                  disabled={loading}
                  icon={loading ? undefined : <SendRounded />}
                >
                  {loading ? "Sending..." : "Send Message"}
                </Button>

                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-xl border border-green-100 bg-green-50 p-4 text-center text-sm font-bold text-green-600"
                    >
                      Message sent successfully! We'll get back to you soon.
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
