"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChatBubbleRounded,
  WhatsApp,
  SendRounded,
  AccessTimeFilledRounded,
  ExpandMore,
  PersonRounded,
  EmailRounded,
  CallToActionRounded,
} from "@mui/icons-material";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";

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
    <div className="min-h-screen bg-cloud-200 py-28">
      {/* Header Section */}
      <div className="container mx-auto px-4 lg:px-0">
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <h1 className="mb-8 font-sans text-3xl font-bold tracking-tight text-brand-500/90 sm:text-4xl lg:text-6xl lg:leading-[1.1]">
            Frequently Asked <span className="text-ocean-500">Questions</span>
          </h1>
          <p className="mb-10 text-center text-sm tracking-wide text-brand-500/40 sm:text-base">
            Find quick answers to common questions about top-ups, accounts, and
            security.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="mx-auto mb-28 max-w-4xl space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-4xl bg-smoke-200 shadow-enstore transition-all duration-300 hover:shadow-ocean-500/10"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="flex w-full items-center justify-between p-6 text-left focus:outline-none sm:p-8"
              >
                <span className="text-lg font-bold text-brand-500/90">
                  {faq.question}
                </span>
                <span
                  className={`transition-all duration-300 ease-in-out ${openIndex === index ? "rotate-180! text-ocean-500" : "rotate-0 text-brand-500/30"}`}
                >
                  <ExpandMore className={`h-[20px]! w-[20px]!`} />
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
                    <div className="px-8 pb-8 leading-relaxed text-brand-500/60 sm:px-8">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mx-auto max-w-6xl rounded-[48px] bg-smoke-200 p-6 shadow-enstore sm:px-8 sm:py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column: Contact Info */}
            <div className="flex flex-col">
              <h2 className="mb-6 text-2xl font-bold text-brand-500/90">
                Contact Us
              </h2>
              <p className="mb-6 text-brand-500/40">
                Fill out the form and our specialized support team will get back
                to you shortly.
              </p>

              <div className="flex-1 space-y-4">
                {/* Live Chat */}
                <div className="flex items-center gap-4 rounded-full bg-ocean-500/10 p-4">
                  <div className="flex items-center justify-center rounded-full bg-ocean-500 p-2 text-smoke-200">
                    <ChatBubbleRounded className="h-6! w-6!" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-medium text-brand-500/90">
                      Live Chat
                    </h3>
                    <p className="text-xs text-ocean-500">
                      Wait time {"<"} 2 mins
                    </p>
                  </div>
                </div>

                {/* WhatsApp Support */}
                <div className="flex items-center gap-4 rounded-full bg-green-500/10 p-4">
                  <div className="flex items-center justify-center rounded-full bg-green-500 p-2 text-smoke-200">
                    <WhatsApp className="h-6! w-6!" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-medium text-brand-500/90">
                      WhatsApp Support
                    </h3>
                    <p className="text-xs text-green-600">
                      Wait time {"<"} 5 mins
                    </p>
                  </div>
                </div>
              </div>

              {/* Office Hours */}
              <div className="rounded-2xl bg-cloud-200 p-4">
                <div className="mb-4 flex items-center gap-2 text-brand-500/40">
                  <AccessTimeFilledRounded className="h-[20px]! w-[20px]!" />
                  <span className="font-medium tracking-widest uppercase">
                    Office Hours
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-500/40">Mon - Fri</span>
                    <span className="font-bold text-brand-500/90">
                      9:00 AM - 6:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-500/40">Sat - Sun</span>
                    <span className="font-bold text-brand-500/90">
                      10:00 AM - 2:00 PM
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="col-span-2">
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                  <Input
                    inputSize="md"
                    label="Full Name"
                    placeholder="John Doe"
                    icon={<PersonRounded />}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    fullWidth={true}
                  />

                  <Input
                    inputSize="md"
                    label="Email Address"
                    placeholder="john@example.com"
                    icon={<EmailRounded />}
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    fullWidth={true}
                  />
                </div>

                <Input
                  inputSize="md"
                  label="Subject"
                  placeholder="How can we help?"
                  icon={<CallToActionRounded />}
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  fullWidth={true}
                />

                <Textarea
                  textareaSize="md"
                  label="Message"
                  icon={<ChatBubbleRounded />}
                  required
                  rows={5}
                  placeholder="Please describe your issue in detail..."
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  fullWidth={true}
                  className="rounded-4xl!"
                />

                <Button
                  variant="primary"
                  className="w-full"
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
