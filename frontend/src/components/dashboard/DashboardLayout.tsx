"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
      <div className="flex min-h-screen items-center justify-center bg-cloud-200 transition-colors duration-300">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-ocean-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cloud-200">
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        className={`relative flex min-h-screen flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? "lg:ml-64" : ""}`}
      >
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 lg:p-8">
          <div className="container mx-auto px-4 py-8 lg:px-6">{children}</div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
