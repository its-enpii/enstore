"use client";

import React, { useState, useEffect, useRef } from "react";
import { NotificationsRounded } from "@mui/icons-material";
import { motion, AnimatePresence } from "motion/react";
import { api, ENDPOINTS } from "@/lib/api";
import { useRouter } from "next/navigation";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "promo";
  data: any;
  is_read: boolean;
  created_at: string;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        api.get<any>(ENDPOINTS.customer.notifications.list, undefined, true),
        api.get<any>(ENDPOINTS.customer.notifications.count, undefined, true),
      ]);

      if (listRes.success) {
        setNotifications(listRes.data.data);
      }
      if (countRes.success) {
        setUnreadCount(countRes.data.count);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.post(ENDPOINTS.customer.notifications.markAsRead(id), {}, true);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post(ENDPOINTS.customer.notifications.markAllAsRead, {}, true);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  // Custom time ago function to replace date-fns
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " tahun yang lalu";

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " bulan yang lalu";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " hari yang lalu";

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " jam yang lalu";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " menit yang lalu";

    return "Baru saja";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-brand-500/60 transition-all hover:bg-ocean-500/10 hover:text-ocean-500"
      >
        <NotificationsRounded />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 h-2 w-2 animate-pulse rounded-full border-2 border-white bg-red-500" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-brand-500/5 bg-white shadow-xl md:w-96"
          >
            <div className="flex items-center justify-between border-b border-brand-500/5 p-4">
              <h3 className="font-bold text-brand-500">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-bold text-ocean-500 hover:text-ocean-600"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-brand-500/40">
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/5 text-brand-500/20">
                    <NotificationsRounded fontSize="medium" />
                  </div>
                  <p className="text-sm text-brand-500/40">
                    No notifications yet
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-brand-500/5">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() =>
                        !notification.is_read &&
                        handleMarkAsRead(notification.id)
                      }
                      className={`flex cursor-pointer gap-3 p-4 transition-colors hover:bg-brand-500/5 ${!notification.is_read ? "bg-ocean-500/5" : ""}`}
                    >
                      <div
                        className={`mt-2 h-2 w-2 shrink-0 rounded-full ${!notification.is_read ? "bg-ocean-500" : "bg-transparent"}`}
                      />
                      <div className="flex-1">
                        <div className="mb-1 flex items-start justify-between">
                          <h4
                            className={`text-sm font-bold ${!notification.is_read ? "text-brand-500" : "text-brand-500/60"}`}
                          >
                            {notification.title}
                          </h4>
                          <span className="ml-2 text-[10px] whitespace-nowrap text-brand-500/30">
                            {timeAgo(notification.created_at)}
                          </span>
                        </div>
                        <p className="mb-2 text-xs leading-relaxed text-brand-500/50">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-brand-500/5 bg-brand-500/5 p-2 text-center">
              <button
                onClick={() => router.push("/dashboard/notifications")}
                className="block w-full py-1 text-xs font-bold text-brand-500/40 transition-colors hover:text-ocean-500"
              >
                View All Activity
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
