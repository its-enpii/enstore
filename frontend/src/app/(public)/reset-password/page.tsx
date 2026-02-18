"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/lib/api/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  LockRounded,
  CheckCircleRounded,
  VisibilityRounded,
  VisibilityOffRounded,
} from "@mui/icons-material";
import { toast } from "react-hot-toast";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid password reset link.");
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !email) return;

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Link may be expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 rounded-3xl bg-smoke-200 p-8 text-center shadow-xl shadow-brand-500/5">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ocean-500/10 text-ocean-500">
            <CheckCircleRounded sx={{ fontSize: 32 }} />
          </div>
          <h2 className="text-2xl font-bold text-brand-500/90">All Set!</h2>
          <p className="text-brand-500/60">
            Your password has been reset successfully. Redirecting to login...
          </p>
          <Link href="/login" className="block w-full">
            <Button className="w-full">Login Now</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-smoke-200 p-8 shadow-xl shadow-brand-500/5">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-brand-500/90">
            Set New Password
          </h2>
          <p className="mt-2 text-sm text-brand-500/60">
            Please enter your new password below.
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
              label="New Password"
              type={showPassword ? "text" : "password"}
              required
              startIcon={<LockRounded />}
              endIcon={
                showPassword ? <VisibilityOffRounded /> : <VisibilityRounded />
              }
              onEndIconClick={() => setShowPassword(!showPassword)}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />

            <Input
              label="Confirm New Password"
              type={showPassword ? "text" : "password"}
              required
              startIcon={<LockRounded />}
              placeholder="Confirm New Password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              fullWidth
            />
          </div>

          <Button
            type="submit"
            isLoading={loading}
            className="w-full"
            disabled={!!error && !token}
          >
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={<div className="flex justify-center p-20">Loading...</div>}
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
