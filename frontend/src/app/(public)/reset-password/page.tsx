"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/lib/api/auth";
import Button from "@/components/ui/Button";
import { LockRounded, CheckCircleRounded, VisibilityRounded, VisibilityOffRounded } from "@mui/icons-material";
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
      setError(err.response?.data?.message || "Failed to reset password. Link may be expired.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
      return (
        <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 rounded-3xl bg-smoke-200 p-8 shadow-xl shadow-brand-500/5 text-center">
                <div className="mx-auto w-16 h-16 bg-ocean-500/10 rounded-full flex items-center justify-center text-ocean-500 mb-4">
                    <CheckCircleRounded sx={{ fontSize: 32 }} />
                </div>
                <h2 className="text-2xl font-bold text-brand-500/90">All Set!</h2>
                <p className="text-brand-500/60">
                    Your password has been reset successfully. Redirecting to login...
                </p>
                <Link href="/login" className="block w-full">
                    <Button className="w-full">
                        Login Now
                    </Button>
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
            <div className="bg-red-500/10 text-red-500 p-3 rounded-xl text-sm font-medium text-center">
                {error}
            </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Password */}
            <div>
               <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <LockRounded className="h-5 w-5 text-brand-500/40" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full rounded-2xl border-0 bg-smoke-200 py-4 pl-12 pr-12 text-brand-500/90 ring-1 ring-inset ring-brand-500/5 placeholder:text-brand-500/40 focus:ring-2 focus:ring-inset focus:ring-ocean-500 sm:text-sm sm:leading-6"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-brand-500/40 hover:text-brand-500/90"
                  >
                    {showPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
                  </button>
               </div>
            </div>

            {/* Confirm Password */}
            <div>
               <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <LockRounded className="h-5 w-5 text-brand-500/40" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full rounded-2xl border-0 bg-smoke-200 py-4 pl-12 pr-12 text-brand-500/90 ring-1 ring-inset ring-brand-500/5 placeholder:text-brand-500/40 focus:ring-2 focus:ring-inset focus:ring-ocean-500 sm:text-sm sm:leading-6"
                    placeholder="Confirm New Password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                  />
               </div>
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full" disabled={!!error && !token}>
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-20">Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
