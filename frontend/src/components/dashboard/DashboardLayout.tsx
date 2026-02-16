"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "admin" | "retail" | "reseller";
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  role,
}) => {
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Initial state based on screen size
    if (window.innerWidth < 1024) {
      setSidebarHidden(true);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    // Strict Role Separation
    if (!loading && user) {
      if (user.role === "admin") {
        if (role !== "admin") {
          router.push("/admin/dashboard");
        }
      } else if (user.customer_type === "reseller") {
        if (role !== "reseller") {
          router.push("/reseller/dashboard");
        }
      } else {
        // retail / customer
        if (role !== "retail") {
          router.push("/dashboard");
        }
      }
    }
  }, [user, loading, role, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-smoke-200 transition-colors duration-300">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-ocean-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={`min-h-screen`}>
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-brand-900/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${sidebarHidden ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"}`}
        onClick={() => setSidebarHidden(true)}
      />

      <div className="min-h-screen bg-slate-50 transition-colors duration-300">
        {/* Sidebar */}
        <aside
          className={`fixed top-0 bottom-0 left-0 z-40 flex w-72 flex-col border-r border-slate-100 bg-white transition-transform duration-300 ease-in-out ${sidebarHidden ? "-translate-x-full" : "translate-x-0"}`}
        >
          <Sidebar role={role} onClose={() => setSidebarHidden(true)} />
        </aside>

        {/* Main Content Area */}
        <div
          className={`flex min-h-screen flex-col transition-all duration-300 ease-in-out ${sidebarHidden ? "ml-0" : "ml-0 lg:ml-72"}`}
        >
          <Navbar onToggleSidebar={() => setSidebarHidden(!sidebarHidden)} />

          <main className="relative flex-1 overflow-x-hidden p-4 lg:p-8">
            <div className="container mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {children}
              </motion.div>
            </div>

            <footer className="mt-auto border-t border-brand-500/5 py-8 text-center">
              <p className="text-center text-sm font-bold text-brand-500/40">
                &copy; 2026 ENCORE UI &bull; ENSTORE PLATFORM
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
