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
  PersonRounded,
  PhoneRounded,
  ConfirmationNumberRounded,
  ArrowForwardRounded,
} from "@mui/icons-material";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { register } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  const [formData, setFormData] = useState({
    name: "", // Will be constructed on submit
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    referral_code: "",
    terms: false,
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    if (!formData.terms) {
      toast.error("You must agree to the Terms of Service");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    const payload = {
        ...formData,
        name: `${firstName} ${lastName}`.trim(),
    };

    try {
      const res = await register(payload);
      if (res.success) {
        toast.success("Registration successful! Please login.");
        router.push("/login");
      } else {
        toast.error(res.message || "Registration failed");
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
      <div className="w-full max-w-4xl rounded-[48px] bg-smoke-200 p-10 shadow-enstore">
        <div className="mt-6 mb-8 text-center">
          <h1 className="mb-4 text-[32px] font-bold text-brand-500/90">Create Account</h1>
          <p className="text-brand-500/40">
            Join thousands of gamers managing their assets with EnStore.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-12 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
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
              type="text"
              error={fieldErrors.email?.[0]}
            />
          </div>

          <Input
            label="First Name"
            placeholder="John"
            startIcon={<PersonRounded />}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            fullWidth
            error={fieldErrors.name?.[0]}
          />

          <Input
            label="Last Name"
            placeholder="Doe"
            startIcon={<PersonRounded />}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            fullWidth
          />

          <Input
            label="Phone"
            placeholder="081234567890"
            startIcon={<PhoneRounded />}
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            required
            fullWidth
            type="tel"
            error={fieldErrors.phone?.[0]}
          />

          <Input
            label="Referral Code (optional)"
            placeholder="112345"
            startIcon={<ConfirmationNumberRounded />}
            value={formData.referral_code}
            onChange={(e) =>
              setFormData({ ...formData, referral_code: e.target.value })
            }
            fullWidth
            error={fieldErrors.referral_code?.[0]}
          />

          <div className="sm:col-span-2">
            <Input
              label="Password"
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

          <div className="sm:col-span-2">
            <Input
              label="Password Confirmation"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="**********"
              startIcon={<LockRounded />}
              endIcon={
                showConfirmPassword ? <VisibilityOffRounded /> : <VisibilityRounded />
              }
              onEndIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
              value={formData.password_confirmation}
              onChange={(e) =>
                setFormData({ ...formData, password_confirmation: e.target.value })
              }
              required
              fullWidth
            />
          </div>

          <div className="flex items-center gap-3 px-1 sm:col-span-2">
            <input
              type="checkbox"
              id="terms"
              checked={formData.terms}
              onChange={(e) =>
                setFormData({ ...formData, terms: e.target.checked })
              }
              className="h-5 w-5 rounded-md border-gray-300 text-ocean-500 focus:ring-ocean-500"
            />
            <label htmlFor="terms" className="text-sm text-brand-500/70">
              I agree to the{" "}
              <Link href="/terms" className="font-semibold text-ocean-500 hover:text-ocean-600">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-semibold text-ocean-500 hover:text-ocean-600">
                Privacy Policy
              </Link>
              .
            </label>
          </div>

          <div className="mt-2 sm:col-span-2">
             <Button
                type="submit"
                variant="primary"
                className="w-full justify-center py-4 text-lg"
                isLoading={loading}
                icon={<ArrowForwardRounded />}
                iconPosition="right"
              >
                Create Account
              </Button>
          </div>
        </form>

        <div className="my-10 flex items-center gap-4">
          <div className="h-px flex-1 bg-brand-500/5"></div>
          <span className="text-xs font-medium tracking-widest text-brand-500/40 uppercase">
            OR CONTINUE WITH
          </span>
          <div className="h-px flex-1 bg-brand-500/5"></div>
        </div>

        <div className="flex gap-4">
          <Button
            variant="white"
            icon={<Google className="text-red-500" />}
            className="flex-1 border border-brand-500/5"
          >
            Google
          </Button>
          <Button
            variant="white"
            icon={<FacebookRounded className="text-blue-500" />}
            className="flex-1 border border-brand-500/5"
          >
            Facebook
          </Button>
        </div>

        <div className="mt-12 text-center text-brand-500/40">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-ocean-500 cursor-pointer font-semibold hover:text-ocean-600"
          >
            Login here
          </Link>
        </div>
      </div>
    </section>
  );
}
