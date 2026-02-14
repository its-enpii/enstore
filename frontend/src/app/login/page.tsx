"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  AlternateEmailRounded,
  LockRounded,
  VisibilityRounded,
  VisibilityOffRounded,
  Google,
  FacebookRounded,
} from "@mui/icons-material";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    try {
      const res = await login(formData);
      if (res.success) {
        const token = (res.data as any).token; 
        if (token) {
            localStorage.setItem("auth_token", token);
            window.dispatchEvent(new Event("storage"));
            toast.success("Login successful!");
            router.push("/");
        } else {
             toast.error("Login successful but no token received.");
        }
      } else {
        toast.error(res.message || "Login failed");
      }
    } catch (err: any) {
      if (err.errors) {
        setFieldErrors(err.errors);
        toast.error("Please check your input fields.");
      } else {
        toast.error(err.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex justify-center bg-cloud-200 py-28 px-4">
      <div className="w-full max-w-lg rounded-[48px] bg-smoke-200 p-10 shadow-enstore">
        <div className="mt-6 mb-8 text-center">
          <h1 className="mb-4 text-[32px] font-bold text-brand-500/90">Welcome Back</h1>
          <p className="text-brand-500/40">
            Please enter your details to access your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-16 flex flex-col gap-8">
          <Input
            label="Email or Phone"
            placeholder="john@gmail.com"
            startIcon={<AlternateEmailRounded />}
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            fullWidth
            error={fieldErrors.email?.[0]}
          />

          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <label className="text-sm font-semibold text-slate-700">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-ocean-500 hover:text-ocean-600"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="**********"
              startIcon={<LockRounded />}
              endIcon={
                showPassword ? <VisibilityOffRounded /> : <VisibilityRounded />
              }
              onEndIconClick={() => setShowPassword(!showPassword)}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              fullWidth
              error={fieldErrors.password?.[0]}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center py-4 text-lg"
            isLoading={loading}
          >
            Login to Account
          </Button>
        </form>

        <div className="my-10 flex items-center gap-4">
          <div className="h-px flex-1 bg-brand-500/5"></div>
          <span className="text-xs font-medium tracking-widest text-brand-500/40 uppercase">
            OR CONTINUE WITH
          </span>
          <div className="h-px flex-1 bg-brand-500/5"></div>
        </div>

        <div className="flex gap-4">
          {/* Google Button */}
          <Button
            variant="white"
            icon={<Google className="text-red-500" />}
            className="flex-1 border border-brand-500/5"
          >
            Google
          </Button>
          {/* Facebook Button */}
          <Button
            variant="white"
            icon={<FacebookRounded className="text-blue-500" />}
            className="flex-1 border border-brand-500/5"
          >
            Facebook
          </Button>
        </div>

        <div className="mt-12 text-center text-brand-500/40">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-ocean-500 cursor-pointer"
          >
            Register Now
          </Link>
        </div>
      </div>
    </section>
  );
}
