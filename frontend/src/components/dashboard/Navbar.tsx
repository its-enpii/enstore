"use client";

import React, { useState } from "react";
import {
  MenuRounded,
  SearchRounded,
  KeyboardArrowDownRounded,
  LogoutRounded,
  PersonRounded,
  SettingsRounded,
} from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardConfirmDialog from "./DashboardConfirmDialog";
import NotificationDropdown from "./NotificationDropdown";

interface NavbarProps {
  onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-brand-500/5 bg-smoke-200/90 backdrop-blur-md transition-colors">
      <div className="flex h-20 items-center justify-between px-4 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="group rounded-xl p-2 transition-all duration-300 hover:bg-ocean-500/5"
          >
            <MenuRounded className="text-brand-500/40 transition-colors group-hover:text-ocean-500" />
          </button>

          <div className="ml-4 hidden max-w-sm flex-1 items-center lg:flex">
            <div className="group relative w-full">
              <div className="absolute inset-0 rounded-xl bg-ocean-500/5 opacity-0 blur transition-opacity duration-300 group-hover:opacity-100"></div>
              <div className="relative flex items-center rounded-xl border border-brand-500/5 bg-cloud-200 transition-all duration-300 group-hover:border-ocean-500/30">
                <SearchRounded
                  className="ml-3 text-brand-500/30 transition-colors group-hover:text-ocean-500"
                  fontSize="small"
                />
                <input
                  type="text"
                  placeholder="Search everything..."
                  className="flex-1 bg-transparent px-3 py-3 text-sm font-medium text-brand-500 outline-none placeholder:text-brand-500/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <NotificationDropdown />
          </div>

          <div className="mx-2 h-8 w-px bg-brand-500/10"></div>

          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="group flex items-center gap-3 rounded-xl py-1 pr-1 pl-2 transition-all hover:bg-ocean-500/5"
            >
              <div className="relative">
                <img
                  src={
                    user?.avatar ||
                    `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=0ea5e9&color=fff`
                  }
                  alt="Avatar"
                  className="h-10 w-10 rounded-full ring-2 ring-smoke-200"
                />
                <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-smoke-200 bg-emerald-500"></span>
              </div>
              <div className="hidden text-left lg:block">
                <p className="max-w-[100px] truncate text-xs leading-none font-black text-brand-500">
                  {user?.name}
                </p>
                <p className="mt-1 text-[10px] font-bold text-brand-500/40">
                  {user?.role}
                </p>
              </div>
              <KeyboardArrowDownRounded
                className={`text-brand-500/30 transition-all ${profileOpen ? "rotate-180" : ""}`}
                fontSize="small"
              />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileOpen(false)}
                  ></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 z-20 mt-2 w-72 overflow-hidden rounded-[28px] border border-brand-500/5 bg-smoke-200 shadow-xl shadow-brand-500/5"
                  >
                    {/* Profile Header */}
                    <div className="p-8 pb-6 text-center">
                      <div className="relative mb-4 inline-block">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ocean-500 text-2xl font-black text-smoke-100 ring-4 ring-smoke-200">
                          {user?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() || "EO"}
                        </div>
                      </div>
                      <h4 className="text-base font-black text-brand-500">
                        {user?.name}
                      </h4>
                      <p className="mt-1 text-xs font-bold text-brand-500/40">
                        {user?.email}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="border-t border-brand-500/5 px-3 pt-2 pb-4 transition-colors">
                      <Link
                        href={
                          user?.role === "admin"
                            ? "/admin/profile"
                            : "/reseller/settings?tab=profile"
                        }
                        className="group flex items-center gap-4 rounded-2xl px-5 py-4 text-brand-500 transition-all hover:bg-cloud-200"
                        onClick={() => setProfileOpen(false)}
                      >
                        <PersonRounded className="text-brand-500/30 transition-colors group-hover:text-ocean-500" />
                        <span className="text-sm font-black">My Profile</span>
                      </Link>
                      <Link
                        href={
                          user?.role === "admin"
                            ? "/admin/settings"
                            : "/reseller/settings?tab=security"
                        }
                        className="group flex items-center gap-4 rounded-2xl px-5 py-4 text-brand-500 transition-all hover:bg-cloud-200"
                        onClick={() => setProfileOpen(false)}
                      >
                        <SettingsRounded className="text-brand-500/30 transition-colors group-hover:text-ocean-500" />
                        <span className="text-sm font-black">Settings</span>
                      </Link>

                      <div className="mx-4 my-2 h-px bg-brand-500/5"></div>

                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="group flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-red-500 transition-all hover:bg-red-500/5"
                      >
                        <LogoutRounded className="text-red-500/40 transition-colors group-hover:text-red-500" />
                        <span className="text-sm font-black">Logout</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <DashboardConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
        }}
        title="Logout Confirmation"
        description="Are you sure you want to logout? You will need to login again to access your account."
        confirmLabel="Logout Now"
        cancelLabel="Stay Logged In"
      />
    </header>
  );
};

export default Navbar;
