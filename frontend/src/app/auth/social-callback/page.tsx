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

      // Handle popup flow - check opener and name as backup
      const isPopup =
        (window.opener && window.opener !== window) ||
        window.name === "Social Login";

      console.log("Social Auth Callback:", {
        isPopup,
        windowName: window.name,
        hasToken: !!token,
      });

      if (error) {
        if (isPopup) {
          if (window.opener) {
            window.opener.postMessage(
              { type: "AUTH_ERROR", message: error },
              window.location.origin,
            );
          }
          window.close();
          // Fallback if window.close() is blocked or slow
          setTimeout(() => setStatus("error"), 1000);
          return;
        }
        setStatus("error");
        setErrorMessage(error);
        toast.error(error);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
        return;
      }

      if (token) {
        if (isPopup) {
          if (window.opener) {
            window.opener.postMessage(
              { type: "AUTH_SUCCESS", token, role, customerType },
              window.location.origin,
            );
          }
          window.close();
          // Fallback if window.close() is blocked or slow
          setTimeout(() => router.push("/dashboard"), 1000);
          return;
        }

        // Store the token (fallback for non-popup)
        localStorage.setItem("auth_token", token);
        await refreshUser();
        toast.success("Login berhasil!");

        if (role === "admin") {
          router.push("/admin/dashboard");
        } else if (role === "customer" && customerType === "reseller") {
          router.push("/reseller/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        if (isPopup) {
          if (window.opener) {
            window.opener.postMessage(
              { type: "AUTH_ERROR", message: "Tidak ada token yang diterima" },
              window.location.origin,
            );
          }
          window.close();
          return;
        }
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
      <div className="w-full max-w-md rounded-[48px] bg-smoke-200 p-10 text-center shadow-enstore">
        {status === "loading" ? (
          <>
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-ocean-500/20"></div>
                <div className="absolute top-0 left-0 h-16 w-16 animate-spin rounded-full border-4 border-ocean-500 border-t-transparent"></div>
              </div>
            </div>
            <h2 className="mb-2 text-xl font-bold text-brand-500/90">
              Sedang Memproses...
            </h2>
            <p className="text-brand-500/40">
              Mohon tunggu, kami sedang memverifikasi akun Anda.
            </p>
          </>
        ) : (
          <>
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-8 w-8 text-red-500"
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
            <h2 className="mb-2 text-xl font-bold text-red-500">Login Gagal</h2>
            <p className="mb-6 text-brand-500/40">{errorMessage}</p>
            <p className="text-sm text-brand-500/30">
              Mengalihkan ke halaman login...
            </p>
          </>
        )}
      </div>
    </section>
  );
}
