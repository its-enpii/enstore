"use client";

import React, { useState, useEffect } from "react";
import {
  NotificationsRounded,
  ShoppingCartRounded,
  DnsRounded,
  PersonAddRounded,
  InfoRounded,
  WarningRounded,
  CheckCircleRounded,
} from "@mui/icons-material";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type AppNotification,
} from "@/lib/api/customer";
import toast from "react-hot-toast";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notifsRes, countRes] = await Promise.all([
        getNotifications(),
        getUnreadNotificationCount(),
      ]);

      if (notifsRes.success) {
        setNotifications(notifsRes.data.data);
      }
      if (countRes.success) {
        setUnreadCount(countRes.data.count);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Optional: Poll every minute
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() })),
      );
      toast.success("All marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.read_at) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id
              ? { ...n, read_at: new Date().toISOString() }
              : n,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Failed to mark as read", error);
      }
    }
  };

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case "cart":
      case "order":
        return <ShoppingCartRounded fontSize="small" />;
      case "user":
      case "person":
        return <PersonAddRounded fontSize="small" />;
      case "system":
      case "server":
        return <DnsRounded fontSize="small" />;
      case "warning":
        return <WarningRounded fontSize="small" />;
      case "success":
        return <CheckCircleRounded fontSize="small" />;
      default:
        return <NotificationsRounded fontSize="small" />;
    }
  };

  const getIconColorRaw = (type?: string) => {
    switch (type) {
      case "order":
      case "info":
        return "bg-indigo-50 text-indigo-600";
      case "warning":
        return "bg-amber-50 text-amber-600";
      case "success":
        return "bg-emerald-50 text-emerald-600";
      case "error":
        return "bg-rose-50 text-rose-600";
      default:
        return "bg-brand-50 text-brand-600";
    }
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "just now";
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative rounded-xl p-2.5 transition-all duration-300 hover:bg-ocean-500/10"
      >
        <NotificationsRounded className="text-xl text-brand-500/60 transition-colors group-hover:text-ocean-500" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ocean-500 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-ocean-500"></span>
          </span>
        )}
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
              <h3 className="font-semibold text-brand-500/90">
                Notifications ({unreadCount})
              </h3>
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-ocean-600 hover:underline"
              >
                Mark all as read
              </button>
            </div>

            <div className="custom-scrollbar max-h-[300px] overflow-y-auto">
              {loading && notifications.length === 0 && (
                <div className="p-4 text-center text-xs text-brand-500/50">
                  Loading...
                </div>
              )}

              {!loading && notifications.length === 0 && (
                <div className="p-8 text-center text-sm text-brand-500/50">
                  No notifications
                </div>
              )}

              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex cursor-pointer gap-4 p-4 transition-colors hover:bg-smoke-300 ${
                    !notification.read_at ? "bg-ocean-50/50" : ""
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getIconColorRaw(
                      notification.type || "info",
                    )}`}
                  >
                    {getIcon(notification.data.icon)}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm text-brand-500/90 ${
                        !notification.read_at ? "font-semibold" : "font-medium"
                      }`}
                    >
                      {notification.title || "New Notification"}
                    </p>
                    <p className="mt-1 text-xs text-brand-500/50">
                      {notification.message || ""}
                    </p>
                    <p className="mt-1 text-[10px] text-brand-500/40">
                      {timeAgo(notification.created_at)}
                    </p>
                  </div>
                  {!notification.read_at && (
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-ocean-500"></div>
                  )}
                </div>
              ))}
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
