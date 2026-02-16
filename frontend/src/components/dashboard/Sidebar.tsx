"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DashboardRounded,
  ShoppingCartRounded,
  PeopleRounded,
  SettingsRounded,
  LogoutRounded,
  AccountBalanceWalletRounded,
  HistoryRounded,
  LocalOfferRounded,
  PaymentRounded,
  ViewCarouselRounded,
  CloseRounded,
  KeyboardArrowRightRounded,
  GamepadRounded,
  ReceiptLongRounded,
  AdminPanelSettingsRounded,
  ContactSupportRounded,
  StorefrontRounded,
  FavoriteRounded,
  AutoGraphRounded,
  MonetizationOnRounded,
  ConfirmationNumberRounded,
} from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import DashboardConfirmDialog from "./DashboardConfirmDialog";
import { api, ENDPOINTS } from "@/lib/api";
import { useEffect } from "react";

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
}

const Sidebar: React.FC<SidebarProps> = ({ role, onClose }) => {
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
            header: "Main Menu",
            items: [
              {
                title: "Dashboard",
                icon: <DashboardRounded />,
                href: "/admin/dashboard",
              },
              {
                title: "Analytics",
                icon: <AutoGraphRounded />,
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
            header: "Management",
            items: [
              {
                title: "Transactions",
                href: "/admin/transactions",
                icon: <ReceiptLongRounded />,
                badge: pendingCount > 0 ? String(pendingCount) : undefined,
              },
              {
                title: "Categories & Products",
                icon: <GamepadRounded />,
                subItems: [
                  { title: "Categories", href: "/admin/categories" },
                  { title: "Products/Games", href: "/admin/products" },
                ],
              },
              {
                title: "Users & Customers",
                href: "/admin/users",
                icon: <PeopleRounded />,
              },
              {
                title: "Withdrawal Requests",
                href: "/admin/withdrawals",
                icon: <MonetizationOnRounded />,
              },
              {
                title: "Voucher Management",
                href: "/admin/vouchers",
                icon: <ConfirmationNumberRounded />,
              },
            ],
          },
          {
            header: "System & UI",
            items: [
              {
                title: "Platform Settings",
                href: "/admin/settings",
                icon: <SettingsRounded />,
              },
              {
                title: "Banner Management",
                href: "/admin/banners",
                icon: <ViewCarouselRounded />,
              },
              {
                title: "Activity Logs",
                href: "/admin/logs",
                icon: <HistoryRounded />,
              },
            ],
          },
        ]
      : role === "reseller"
        ? [
            {
              header: "Reseller Panel",
              items: [
                {
                  title: "Dashboard",
                  href: "/reseller/dashboard",
                  icon: <DashboardRounded />,
                },
                {
                  title: "My Wallet",
                  icon: <AccountBalanceWalletRounded />,
                  subItems: walletSubItems,
                },
              ],
            },
            {
              header: "Purchase & Sales",
              items: [
                {
                  title: "Game Services",
                  href: "/services",
                  icon: <StorefrontRounded />,
                  badge: "VIP",
                },
                {
                  title: "Postpaid Service",
                  href: "/reseller/postpaid",
                  icon: <ReceiptLongRounded />,
                  badge: "Pay",
                },
                {
                  title: "Transaction History",
                  href: "/reseller/transactions",
                  icon: <ReceiptLongRounded />,
                },
                {
                  title: "Special Price List",
                  href: "/reseller/prices",
                  icon: <LocalOfferRounded />,
                  badge: "Special",
                },
              ],
            },
            {
              header: "Account",
              items: [
                {
                  title: "My Profile",
                  href: "/reseller/profile",
                  icon: <PeopleRounded />,
                },
              ],
            },
          ]
        : [
            {
              header: "Customer Menu",
              items: [
                {
                  title: "Dashboard",
                  href: "/dashboard",
                  icon: <DashboardRounded />,
                },
                {
                  title: "My Wallet",
                  icon: <AccountBalanceWalletRounded />,
                  subItems: walletSubItems,
                },
              ],
            },
            {
              header: "Shopping",
              items: [
                {
                  title: "Game Services",
                  href: "/services",
                  icon: <StorefrontRounded />,
                },
                {
                  title: "Postpaid Service",
                  href: "/dashboard/postpaid",
                  icon: <ReceiptLongRounded />,
                  badge: "Pay",
                },
                {
                  title: "Transaction History",
                  href: "/dashboard/transactions",
                  icon: <ReceiptLongRounded />,
                },
              ],
            },
            {
              header: "Account",
              items: [
                {
                  title: "My Profile",
                  href: "/dashboard/profile",
                  icon: <PeopleRounded />,
                },
              ],
            },
          ];

  return (
    <>
      <div className="flex h-16 shrink-0 items-center border-b border-slate-100 px-6">
        <div className="flex items-center gap-3 text-xl font-bold tracking-tight text-ocean-500">
          <div className="flex h-10 w-10 rotate-3 items-center justify-center rounded-2xl bg-linear-to-br from-ocean-400 to-ocean-600 text-smoke-200 shadow-lg shadow-ocean-500/20">
            <GamepadRounded fontSize="medium" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-2xl font-black tracking-tighter text-brand-500">
              ENSTORE
            </span>
            <span className="text-[10px] font-bold text-brand-500/40">
              Platform
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="ml-auto rounded-xl bg-cloud-200 p-2 text-brand-500/40 hover:text-brand-500 lg:hidden"
        >
          <CloseRounded fontSize="small" />
        </button>
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto">
        <nav className="px-3 py-6">
          <ul className="space-y-6">
            {menuSections.map((section, idx) => (
              <li key={idx} className="space-y-2">
                <div className="mt-2 px-3.5 py-2.5 text-xs font-bold tracking-wide text-slate-700 uppercase">
                  {section.header}
                </div>
                <ul className="space-y-1">
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

                    if (
                      hasSubItems &&
                      item.subItems?.some((sub) => pathname === sub.href) &&
                      !isOpen
                    ) {
                      setOpenMenus((prev) => ({ ...prev, [item.title]: true }));
                    }

                    // Encore UI Style Mappings
                    const linkBaseClass =
                      "w-full text-left flex items-center gap-2 px-3.5 py-2.5 text-sm font-normal rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group";
                    const linkActiveClass =
                      "bg-transparent font-bold text-ocean-500";
                    const linkInactiveClass = "text-slate-700";

                    const iconClass = `text-lg mr-1.5 transition-colors duration-200 ${isActive || isOpen ? "text-ocean-500" : "text-slate-500 group-hover:text-slate-700"}`;
                    const chevronClass = `ml-auto text-sm transition-transform duration-200 ${isOpen ? "rotate-90" : ""} ${isActive || isOpen ? "text-ocean-500" : "text-slate-400"}`;

                    return (
                      <li key={itemIdx}>
                        {hasSubItems ? (
                          <>
                            <button
                              onClick={() => toggleMenu(item.title)}
                              className={`${linkBaseClass} ${isActive || isOpen ? linkActiveClass : linkInactiveClass}`}
                            >
                              <span className={iconClass}>{item.icon}</span>
                              <span className="flex-1">{item.title}</span>
                              <KeyboardArrowRightRounded
                                className={chevronClass}
                                fontSize="inherit"
                              />
                            </button>
                            <ul
                              className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                            >
                              <div className="min-h-0">
                                {item.subItems?.map((sub, sIdx) => {
                                  const isSubActive = pathname === sub.href;
                                  return (
                                    <li key={sIdx}>
                                      <Link
                                        href={sub.href}
                                        className={`block rounded-xl px-3.5 py-2.5 pl-9 text-sm transition-colors ${
                                          isSubActive
                                            ? "font-medium text-ocean-500"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                        }`}
                                      >
                                        {sub.title}
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
                            className={`${linkBaseClass} ${isActive ? linkActiveClass : linkInactiveClass}`}
                          >
                            <span className={iconClass}>{item.icon}</span>
                            <span className="flex-1">{item.title}</span>
                            {item.badge && (
                              <span
                                className={`rounded-lg px-2 py-0.5 text-[10px] font-bold text-white ${item.badge === "VIP" ? "bg-ocean-500" : "bg-brand-500"}`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="space-y-2 border-t border-slate-100 p-4">
        <Link
          href="/help"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100"
        >
          <ContactSupportRounded
            className="text-lg text-slate-400"
            fontSize="inherit"
          />
          <span className="font-medium">Help center</span>
        </Link>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
        >
          <LogoutRounded className="text-lg" fontSize="inherit" />
          <span className="font-medium">Logout</span>
        </button>
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
    </>
  );
};

export default Sidebar;
