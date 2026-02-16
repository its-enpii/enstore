"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DashboardRounded, // Solid for Dashboard
  DashboardOutlined,
  SettingsOutlined,
  LogoutOutlined,
  AccountBalanceWalletOutlined,
  HistoryOutlined,
  LocalOfferOutlined,
  ViewCarouselOutlined,
  CloseOutlined,
  KeyboardArrowRightOutlined,
  GamepadOutlined,
  ReceiptLongOutlined,
  PeopleOutlined,
  MonetizationOnOutlined,
  ConfirmationNumberOutlined,
  StorefrontOutlined,
  AutoGraphOutlined,
  ContactSupportOutlined,
  Inventory2Outlined,
} from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import DashboardConfirmDialog from "./DashboardConfirmDialog";
import { api, ENDPOINTS } from "@/lib/api";

interface MenuItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  badge?: string;
  subItems?: { title: string; href: string }[];
}

interface MenuSection {
  header: string;
  items: MenuItem[];
}

interface SidebarProps {
  role: "admin" | "retail" | "reseller";
  onClose?: () => void;
  isOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ role, onClose, isOpen }) => {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    if (role === "admin") {
      const fetchPendingCount = async () => {
        try {
          const res = await api.get(
            ENDPOINTS.admin.transactions.list,
            { status: "pending", per_page: 1 },
            true,
          );
          if (res.success) {
            setPendingCount((res.data as any).total || 0);
          }
        } catch (err) {
          console.error("Failed to fetch pending count for sidebar:", err);
        }
      };

      fetchPendingCount();
      const interval = setInterval(fetchPendingCount, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [role]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Common Wallet Items
  const walletSubItems = [
    {
      title: "My Wallet",
      href: role === "reseller" ? "/reseller/balance" : "/dashboard/balance",
    },
    {
      title: "Top Up Balance",
      href: role === "reseller" ? "/reseller/topup" : "/dashboard/topup",
    },
    {
      title: "Withdrawal",
      href:
        role === "reseller" ? "/reseller/withdrawal" : "/dashboard/withdrawal",
    },
    {
      title: "Mutation History",
      href:
        role === "reseller"
          ? "/reseller/balance/history"
          : "/dashboard/balance/history",
    },
  ];

  // Define Menu Structures
  const menuSections: MenuSection[] =
    role === "admin"
      ? [
          {
            header: "DASHBOARD",
            items: [
              {
                title: "Dashboard",
                icon: <DashboardRounded />,
                href: "/admin/dashboard",
              },
              {
                title: "Analytics",
                icon: <AutoGraphOutlined />,
                subItems: [
                  { title: "Sales Reports", href: "/admin/reports/sales" },
                  { title: "User Growth", href: "/admin/reports/users" },
                  { title: "Product Stats", href: "/admin/reports/products" },
                  { title: "Balance Reports", href: "/admin/reports/balance" },
                  { title: "Payment Methods", href: "/admin/reports/payments" },
                ],
              },
            ],
          },
          {
            header: "MANAGEMENT",
            items: [
              {
                title: "Transactions",
                href: "/admin/transactions",
                icon: <ReceiptLongOutlined />,
                badge: pendingCount > 0 ? String(pendingCount) : undefined,
              },
              {
                title: "Categories & Products",
                icon: <GamepadOutlined />,
                subItems: [
                  { title: "Categories", href: "/admin/categories" },
                  { title: "Products/Games", href: "/admin/products" },
                ],
              },
              {
                title: "Users & Customers",
                href: "/admin/users",
                icon: <PeopleOutlined />,
              },
              {
                title: "Withdrawal Requests",
                href: "/admin/withdrawals",
                icon: <MonetizationOnOutlined />,
              },
              {
                title: "Voucher Management",
                href: "/admin/vouchers",
                icon: <ConfirmationNumberOutlined />,
              },
            ],
          },
          {
            header: "SYSTEM & UI",
            items: [
              {
                title: "Platform Settings",
                href: "/admin/settings",
                icon: <SettingsOutlined />,
              },
              {
                title: "Banner Management",
                href: "/admin/banners",
                icon: <ViewCarouselOutlined />,
              },
              {
                title: "Activity Logs",
                href: "/admin/logs",
                icon: <HistoryOutlined />,
              },
            ],
          },
        ]
      : role === "reseller"
        ? [
            {
              header: "DASHBOARD",
              items: [
                {
                  title: "Dashboard",
                  href: "/reseller/dashboard",
                  icon: <DashboardRounded />,
                },
                {
                  title: "My Wallet",
                  icon: <AccountBalanceWalletOutlined />,
                  subItems: walletSubItems,
                },
              ],
            },
            {
              header: "MANAGEMENT",
              items: [
                {
                  title: "Game Services",
                  href: "/services",
                  icon: <StorefrontOutlined />,
                  badge: "VIP",
                },
                {
                  title: "Postpaid Service",
                  href: "/reseller/postpaid",
                  icon: <ReceiptLongOutlined />,
                  badge: "Pay",
                },
                {
                  title: "Transaction History",
                  href: "/reseller/transactions",
                  icon: <ReceiptLongOutlined />,
                },
                {
                  title: "Special Price List",
                  href: "/reseller/prices",
                  icon: <LocalOfferOutlined />,
                  badge: "Special",
                },
              ],
            },
            {
              header: "ACCOUNT",
              items: [
                {
                  title: "My Profile",
                  href: "/reseller/profile",
                  icon: <PeopleOutlined />,
                },
              ],
            },
          ]
        : [
            {
              header: "DASHBOARD",
              items: [
                {
                  title: "Dashboard",
                  href: "/dashboard",
                  icon: <DashboardRounded />,
                },
                {
                  title: "My Wallet",
                  icon: <AccountBalanceWalletOutlined />,
                  subItems: walletSubItems,
                },
              ],
            },
            {
              header: "MANAGEMENT",
              items: [
                {
                  title: "Game Services",
                  href: "/services",
                  icon: <StorefrontOutlined />,
                },
                {
                  title: "Postpaid Service",
                  href: "/dashboard/postpaid",
                  icon: <ReceiptLongOutlined />,
                  badge: "Pay",
                },
                {
                  title: "Transaction History",
                  href: "/dashboard/transactions",
                  icon: <ReceiptLongOutlined />,
                },
              ],
            },
            {
              header: "ACCOUNT",
              items: [
                {
                  title: "My Profile",
                  href: "/dashboard/profile",
                  icon: <PeopleOutlined />,
                },
              ],
            },
          ];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-20 bg-brand-500/20 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-brand-500/5 bg-smoke-200 shadow-calm transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-full flex-col">
          {/* Brand */}
          <div className="flex h-16 items-center border-b border-brand-500/5 px-6">
            <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-ocean-500">
              <GamepadOutlined className="text-2xl" />
              <span>Encore</span>
            </div>
            <button
              onClick={onClose}
              className="ml-auto text-brand-500/30 hover:text-brand-500/90 lg:hidden"
            >
              <CloseOutlined className="text-2xl" />
            </button>
          </div>

          {/* Navigation */}
          <div className="custom-scrollbar flex-1 overflow-y-auto py-2">
            <nav className="px-2">
              <ul className="nav">
                {menuSections.map((section, idx) => (
                  <React.Fragment key={idx}>
                    <li className="nav-header">{section.header}</li>

                    {section.items.map((item, itemIdx) => {
                      const hasSubItems =
                        item.subItems && item.subItems.length > 0;
                      const isOpen = openMenus[item.title];
                      const isActive = item.href
                        ? item.href === "/dashboard"
                          ? pathname === "/dashboard"
                          : item.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(item.href)
                        : hasSubItems &&
                          item.subItems?.some((sub) => pathname === sub.href);

                      // Auto-open if active
                      useEffect(() => {
                        if (isActive && hasSubItems && !openMenus[item.title]) {
                          setOpenMenus((prev) => ({
                            ...prev,
                            [item.title]: true,
                          }));
                        }
                      }, [isActive, hasSubItems, item.title]);

                      const linkClasses = `nav-link ${isActive ? "active" : ""}`;

                      return (
                        <li
                          key={itemIdx}
                          className={`nav-item ${hasSubItems ? "dropdown" : ""}`}
                        >
                          {hasSubItems ? (
                            <>
                              <button
                                type="button"
                                onClick={() => toggleMenu(item.title)}
                                className={`${linkClasses} w-full`}
                              >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="text-left">{item.title}</span>
                                <KeyboardArrowRightOutlined className="nav-chevron" />
                              </button>
                              <ul
                                className={`nav-submenu ${isOpen ? "show" : ""}`}
                              >
                                <div className="mt-1 space-y-1">
                                  {item.subItems?.map((sub, sIdx) => {
                                    const isSubActive = pathname === sub.href;
                                    return (
                                      <li key={sIdx} className="nav-item">
                                        <Link
                                          href={sub.href}
                                          className={`nav-sub-link ${isSubActive ? "active" : ""}`}
                                        >
                                          <span>{sub.title}</span>
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </div>
                              </ul>
                            </>
                          ) : (
                            <Link
                              href={item.href || "#"}
                              className={linkClasses}
                            >
                              <span className="nav-icon">{item.icon}</span>
                              <span>{item.title}</span>
                              {item.badge && (
                                <span
                                  className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${
                                    item.badge === "VIP"
                                      ? "bg-ocean-500"
                                      : "bg-emerald-500"
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </React.Fragment>
                ))}
              </ul>
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="mt-auto border-t border-brand-500/5 p-4">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="nav-link w-full text-red-600! hover:bg-red-50!"
            >
              <LogoutOutlined className="nav-icon text-red-600!" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

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
    </>
  );
};

export default Sidebar;
