"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/api/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  EmailRounded,
  ArrowBackRounded,
  MarkEmailReadRounded,
} from "@mui/icons-material";
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
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 rounded-3xl bg-smoke-200 p-8 text-center shadow-xl shadow-brand-500/5">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ocean-500/10 text-ocean-500">
            <MarkEmailReadRounded sx={{ fontSize: 32 }} />
          </div>
          <h2 className="text-2xl font-bold text-brand-500/90">
            Check your mail
          </h2>
          <p className="text-brand-500/60">
            We have sent a password recover instructions to your email.
          </p>
          <Link href="/login" className="block w-full">
            <Button className="w-full">Back to Login</Button>
          </Link>
          <p className="mt-4 text-center text-sm text-brand-500/40">
            Did not receive the email? Check your spam filter, or{" "}
            <button
              onClick={() => setSent(false)}
              className="text-ocean-500 hover:underline"
            >
              try another email address
            </button>
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
          <div className="rounded-xl bg-red-500/10 p-3 text-center text-sm font-medium text-red-500">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Email address"
              id="email"
              name="email"
              type="email"
              required
              fullWidth
              startIcon={<EmailRounded />}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3">
            <Button type="submit" isLoading={loading} className="w-full">
              Reset Password
            </Button>
            <Link href="/login" className="w-full">
              <Button
                variant="white"
                className="w-full text-brand-500/60 hover:text-brand-500/90"
                icon={<ArrowBackRounded />}
              >
                Back to Login
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
