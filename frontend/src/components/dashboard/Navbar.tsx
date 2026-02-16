"use client";

import React, { useState } from "react";
import {
  MenuRounded,
  SearchRounded,
  KeyboardArrowDownRounded,
  LogoutRounded,
  PersonRounded,
  SettingsRounded,
  CreditCardRounded,
  NotificationsRounded,
  MessageRounded,
} from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
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
    <header className="relative z-10 w-full">
      <div className="border-b border-brand-500/5 bg-smoke-50/95 backdrop-blur-md">
        <div className="container mx-auto">
          <div className="flex h-16 items-center justify-between px-4 lg:px-6">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              {/* Sidebar Toggle */}
              <button
                onClick={onToggleSidebar}
                className="group rounded-xl p-2 transition-all duration-300 hover:bg-ocean-500/10"
              >
                <MenuRounded className="text-2xl text-brand-500/60 transition-colors group-hover:text-ocean-500" />
              </button>
            </div>

            <div className="mx-8 hidden max-w-xl flex-1 items-center lg:flex">
              <div className="relative w-full">
                <div className="relative flex items-center rounded-xl border border-brand-500/10 bg-brand-500/5 transition-all duration-300 focus-within:border-ocean-500/30 focus-within:bg-smoke-200">
                  <SearchRounded className="ml-4 text-lg text-brand-500/40" />
                  <input
                    type="text"
                    placeholder="Search anything..."
                    className="flex-1 bg-transparent px-4 py-2.5 text-sm text-brand-500/90 outline-none placeholder:text-brand-500/40"
                  />
                  <div className="mr-3 flex items-center gap-1 text-[10px] font-bold text-brand-500/30">
                    <kbd className="rounded border border-brand-500/10 bg-smoke-200 px-1.5 py-0.5">
                      CTRL
                    </kbd>
                    <kbd className="rounded border border-brand-500/10 bg-smoke-200 px-1.5 py-0.5">
                      K
                    </kbd>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-2">
              {/* Quick Actions */}
              <div className="hidden items-center gap-1 sm:flex">
                {/* Notifications Dropdown */}
                <NotificationDropdown />
              </div>

              {/* Divider */}
              <div className="mx-2 hidden h-8 w-px bg-brand-500/10 sm:block"></div>

              {/* Profile Section */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="group flex items-center gap-3 rounded-xl py-1.5 pr-3 pl-2 transition-all duration-300 hover:bg-ocean-500/5"
                >
                  <div className="relative">
                    <img
                      src={
                        user?.avatar ||
                        `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=0ea5e9&color=fff`
                      }
                      alt="Avatar"
                      className="h-9 w-9 rounded-full ring-2 ring-cloud-200 transition-all duration-300 group-hover:ring-ocean-500/30"
                    />
                    <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-cloud-200 bg-emerald-500"></span>
                  </div>
                  <div className="hidden text-left lg:block">
                    <p className="text-sm leading-tight font-semibold text-brand-500/90 transition-colors group-hover:text-ocean-500">
                      {user?.name || "Admin User"}
                    </p>
                    <p className="text-xs text-brand-500/50">
                      {user?.role || "Administrator"}
                    </p>
                  </div>
                  <KeyboardArrowDownRounded
                    className={`hidden text-brand-500/40 transition-all duration-300 group-hover:text-ocean-500 lg:block ${profileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setProfileOpen(false)}
                    ></div>
                    <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-brand-500/5 bg-smoke-200 shadow-xl">
                      <div className="border-b border-brand-500/5 bg-smoke-200/30 p-4 text-center">
                        <div className="mx-auto mb-2 h-16 w-16 overflow-hidden rounded-full bg-smoke-300">
                          <img
                            src={
                              user?.avatar ||
                              `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=0ea5e9&color=fff`
                            }
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <h4 className="font-bold text-brand-500/90">
                          {user?.name || "Admin User"}
                        </h4>
                        <p className="text-xs text-brand-500/50">
                          {user?.email || "admin@encore.com"}
                        </p>
                      </div>

                      <div className="p-2">
                        <Link
                          href={
                            user?.role === "admin"
                              ? "/admin/profile"
                              : "/reseller/profile"
                          }
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-brand-500/70 transition-colors hover:bg-smoke-300 hover:text-brand-500/90"
                          onClick={() => setProfileOpen(false)}
                        >
                          <PersonRounded className="text-lg text-brand-500/40" />
                          My Profile
                        </Link>
                        <Link
                          href={
                            user?.role === "admin"
                              ? "/admin/settings"
                              : "/reseller/settings"
                          }
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-brand-500/70 transition-colors hover:bg-smoke-300 hover:text-brand-500/90"
                          onClick={() => setProfileOpen(false)}
                        >
                          <SettingsRounded className="text-lg text-brand-500/40" />
                          Settings
                        </Link>
                        <a
                          href="#"
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-brand-500/70 transition-colors hover:bg-smoke-300 hover:text-brand-500/90"
                        >
                          <CreditCardRounded className="text-lg text-brand-500/40" />
                          Billing
                        </a>
                      </div>

                      <div className="border-t border-brand-500/5 p-2">
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            setShowLogoutConfirm(true);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                        >
                          <LogoutRounded className="text-lg" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
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
