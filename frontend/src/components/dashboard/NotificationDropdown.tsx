"use client";

import React, { useState } from "react";
import {
  NotificationsRounded,
  ShoppingCartRounded,
  DnsRounded,
  PersonAddRounded,
} from "@mui/icons-material";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative rounded-xl p-2.5 transition-all duration-300 hover:bg-ocean-500/10"
      >
        <NotificationsRounded className="text-xl text-brand-500/60 transition-colors group-hover:text-ocean-500" />
        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ocean-500 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-ocean-500"></span>
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-brand-500/5 bg-smoke-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-brand-500/5 p-4">
              <h3 className="font-semibold text-brand-500/90">Notifications</h3>
              <button className="text-xs text-ocean-600 hover:underline">
                Mark all as read
              </button>
            </div>

            <div className="custom-scrollbar max-h-[300px] overflow-y-auto">
              {/* Notification Items */}
              <a
                href="#"
                className="flex gap-4 p-4 transition-colors hover:bg-smoke-300"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <ShoppingCartRounded fontSize="small" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-500/90">
                    New Order Received
                  </p>
                  <p className="mt-1 text-xs text-brand-500/50">
                    Order #1234 from John Doe has been placed.
                  </p>
                  <p className="mt-1 text-[10px] text-brand-500/40">
                    2 mins ago
                  </p>
                </div>
              </a>

              <a
                href="#"
                className="flex gap-4 p-4 transition-colors hover:bg-smoke-300"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  <DnsRounded fontSize="small" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-500/90">
                    Server Load High
                  </p>
                  <p className="mt-1 text-xs text-brand-500/50">
                    CPU usage is above 90% on Server A.
                  </p>
                  <p className="mt-1 text-[10px] text-brand-500/40">
                    1 hour ago
                  </p>
                </div>
              </a>

              <a
                href="#"
                className="flex gap-4 p-4 transition-colors hover:bg-smoke-300"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <PersonAddRounded fontSize="small" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-500/90">
                    New User Registered
                  </p>
                  <p className="mt-1 text-xs text-brand-500/50">
                    Sarah Smith created an account.
                  </p>
                  <p className="mt-1 text-[10px] text-brand-500/40">
                    3 hours ago
                  </p>
                </div>
              </a>
            </div>

            <div className="border-t border-brand-500/5 p-3 text-center">
              <a
                href="#"
                className="text-sm font-medium text-ocean-600 hover:underline"
              >
                View All Notifications
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
