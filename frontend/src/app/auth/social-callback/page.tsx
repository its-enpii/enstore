"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function SocialCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token");
      const error = searchParams.get("error");
      const role = searchParams.get("role");
      const customerType = searchParams.get("customer_type");

      if (error) {
        setStatus("error");
        setErrorMessage(error);
        toast.error(error);
        // Redirect to login after a delay
        setTimeout(() => {
          router.push("/login");
        }, 3000);
        return;
      }

      if (token) {
        // Store the token
        localStorage.setItem("auth_token", token);

        // Refresh user context
        await refreshUser();

        toast.success("Login berhasil!");

        // Determine where to redirect
        if (role === "admin") {
          router.push("/admin/dashboard");
        } else if (role === "customer" && customerType === "reseller") {
          router.push("/reseller/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        setStatus("error");
        setErrorMessage("Tidak ada token yang diterima dari server.");
        toast.error("Login gagal - token tidak ditemukan");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router, refreshUser]);

  return (
    <section className="flex min-h-screen items-center justify-center bg-cloud-200">
      <div className="w-full max-w-md rounded-[48px] bg-smoke-200 p-10 shadow-enstore text-center">
        {status === "loading" ? (
          <>
            {/* Loading Spinner */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-ocean-500/20 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
            </div>
            <h2 className="text-xl font-bold text-brand-500/90 mb-2">
              Sedang Memproses...
            </h2>
            <p className="text-brand-500/40">
              Mohon tunggu, kami sedang memverifikasi akun Anda.
            </p>
          </>
        ) : (
          <>
            {/* Error State */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-red-500 mb-2">
              Login Gagal
            </h2>
            <p className="text-brand-500/40 mb-6">
              {errorMessage}
            </p>
            <p className="text-sm text-brand-500/30">
              Mengalihkan ke halaman login...
            </p>
          </>
        )}
      </div>
    </section>
  );
}
