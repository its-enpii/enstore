"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/api/auth";
import Button from "@/components/ui/Button";
import { EmailRounded, ArrowBackRounded, MarkEmailReadRounded } from "@mui/icons-material";
import { toast } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // API call
      await forgotPassword(email);
      // Wait a bit to simulate processing or assume success if API doesn't throw
      // Usually API returns success: true
      setSent(true);
      toast.success("Reset link sent to your email!");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 rounded-3xl bg-smoke-200 p-8 shadow-xl shadow-brand-500/5 text-center">
            <div className="mx-auto w-16 h-16 bg-ocean-500/10 rounded-full flex items-center justify-center text-ocean-500 mb-4">
                <MarkEmailReadRounded sx={{ fontSize: 32 }} />
            </div>
            <h2 className="text-2xl font-bold text-brand-500/90">Check your mail</h2>
            <p className="text-brand-500/60">
                We have sent a password recover instructions to your email.
            </p>
            <Link href="/login" className="block w-full">
                <Button className="w-full">
                    Back to Login
                </Button>
            </Link>
             <p className="mt-4 text-center text-sm text-brand-500/40">
                Did not receive the email? Check your spam filter, or <button onClick={() => setSent(false)} className="text-ocean-500 hover:underline">try another email address</button>
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-smoke-200 p-8 shadow-xl shadow-brand-500/5">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-brand-500/90">
            Forgot Password?
          </h2>
          <p className="mt-2 text-sm text-brand-500/60">
            No worries, we'll send you reset instructions.
          </p>
        </div>

        {error && (
            <div className="bg-red-500/10 text-red-500 p-3 rounded-xl text-sm font-medium text-center">
                {error}
            </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <EmailRounded className="h-5 w-5 text-brand-500/40" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-2xl border-0 bg-smoke-200 py-4 pl-12 text-brand-500/90 ring-1 ring-inset ring-brand-500/5 placeholder:text-brand-500/40 focus:ring-2 focus:ring-inset focus:ring-ocean-500 sm:text-sm sm:leading-6 transition-all"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
             <Button type="submit" loading={loading} className="w-full">
                Reset Password
             </Button>
             <Link href="/login" className="w-full">
                <Button variant="ghost" className="w-full text-brand-500/60 hover:text-brand-500/90" icon={<ArrowBackRounded />}>
                    Back to Login
                </Button>
             </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
