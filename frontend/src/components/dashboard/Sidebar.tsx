"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  AutoGraphRounded
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import DashboardConfirmDialog from './DashboardConfirmDialog';

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
  role: 'admin' | 'retail' | 'reseller';
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, onClose }) => {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // Common Wallet Items
  const walletSubItems = [
    { title: 'My Wallet', href: role === 'reseller' ? '/reseller/balance' : '/dashboard/balance' },
    { title: 'Top Up Balance', href: role === 'reseller' ? '/reseller/topup' : '/dashboard/topup' },
    { title: 'Withdrawal', href: role === 'reseller' ? '/reseller/withdrawal' : '/dashboard/withdrawal' },
    { title: 'Mutation History', href: role === 'reseller' ? '/reseller/balance/history' : '/dashboard/balance/history' },
  ];

  // Define Menu Structures
  const menuSections: MenuSection[] = role === 'admin' ? [
    {
      header: 'Main Menu',
      items: [
        { title: 'Dashboard', icon: <DashboardRounded className="nav-icon" />, href: '/admin/dashboard' },
        { 
          title: 'Analytics', 
          icon: <AutoGraphRounded className="nav-icon" />,
          subItems: [
              { title: 'Sales Reports', href: '/admin/reports/sales' },
              { title: 'User Growth', href: '/admin/reports/users' },
              { title: 'Product Stats', href: '/admin/reports/products' }
          ]
        },
      ]
    },
    {
      header: 'Management',
      items: [
        { title: 'Transactions', href: '/admin/transactions', icon: <ReceiptLongRounded className="nav-icon" />, badge: 'New' },
        { 
          title: 'Categories & Products', 
          icon: <GamepadRounded className="nav-icon" />,
          subItems: [
              { title: 'Categories', href: '/admin/categories' },
              { title: 'Products/Games', href: '/admin/products' },
          ]
        },
        { title: 'Users & Customers', href: '/admin/users', icon: <PeopleRounded className="nav-icon" /> },
        { title: 'Payments', href: '/admin/payments', icon: <PaymentRounded className="nav-icon" /> },
      ]
    },
    {
      header: 'System & UI',
      items: [
        { title: 'Banners & Promo', href: '/admin/banners', icon: <ViewCarouselRounded className="nav-icon" /> },
        { title: 'Platform Settings', href: '/admin/settings', icon: <SettingsRounded className="nav-icon" /> },
        { title: 'Activity Logs', href: '/admin/logs', icon: <HistoryRounded className="nav-icon" /> },
      ]
    },
  ] : role === 'reseller' ? [
    {
      header: 'Reseller Panel',
      items: [
        { title: 'Dashboard', href: '/reseller/dashboard', icon: <DashboardRounded className="nav-icon" /> },
        { 
          title: 'My Wallet', 
          icon: <AccountBalanceWalletRounded className="nav-icon" />,
          subItems: walletSubItems
        },
      ]
    },
    {
      header: 'Purchase & Sales',
      items: [
        { title: 'Game Services', href: '/services', icon: <StorefrontRounded className="nav-icon" />, badge: 'VIP' },
        { title: 'Transaction History', href: '/reseller/transactions', icon: <ReceiptLongRounded className="nav-icon" /> },
        { title: 'Special Price List', href: '/reseller/prices', icon: <LocalOfferRounded className="nav-icon" />, badge: 'Special' },
      ]
    },
    {
      header: 'Account',
      items: [
        { title: 'My Profile', href: '/reseller/profile', icon: <PeopleRounded className="nav-icon" /> },
      ]
    }
  ] : [
    {
      header: 'Customer Menu',
      items: [
        { title: 'Dashboard', href: '/dashboard', icon: <DashboardRounded className="nav-icon" /> },
        {
          title: 'My Wallet',
          icon: <AccountBalanceWalletRounded className="nav-icon" />,
          subItems: walletSubItems
        },
      ]
    },
    {
      header: 'Shopping',
      items: [
        { title: 'Game Services', href: '/services', icon: <StorefrontRounded className="nav-icon" /> },
        { title: 'Transaction History', href: '/dashboard/transactions', icon: <ReceiptLongRounded className="nav-icon" /> },
      ]
    },
    {
      header: 'Account',
      items: [
        { title: 'My Profile', href: '/dashboard/profile', icon: <PeopleRounded className="nav-icon" /> },
      ]
    }
  ];

  return (
    <>
      <div className="h-20 flex items-center px-6 border-b border-brand-500/5 shrink-0">
        <div className="flex items-center gap-3 font-bold text-xl text-ocean-500 tracking-tight">
          <div className="w-10 h-10 bg-linear-to-br from-ocean-400 to-ocean-600 rounded-2xl flex items-center justify-center text-smoke-200 shadow-lg shadow-ocean-500/20 rotate-3">
            <GamepadRounded fontSize="medium" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-brand-500 font-black tracking-tighter text-2xl">ENSTORE</span>
            <span className="text-[10px] text-brand-500/40 font-bold">Platform</span>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden ml-auto p-2 text-brand-500/40 hover:text-brand-500 bg-cloud-200 rounded-xl">
          <CloseRounded fontSize="small" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <nav className="px-3 py-6">
          <ul className="space-y-6">
            {menuSections.map((section, idx) => (
              <li key={idx} className="space-y-2">
                <div className="nav-header flex items-center gap-2 pl-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-ocean-500"></div>
                   {section.header}
                </div>
                <ul className="space-y-1">
                  {section.items.map((item, itemIdx) => {
                    const hasSubItems = item.subItems && item.subItems.length > 0;
                    const isOpen = openMenus[item.title];
                    const isActive = item.href 
                        ? (item.href === '/dashboard' ? pathname === '/dashboard' : item.href === '/' ? pathname === '/' : pathname.startsWith(item.href))
                        : (hasSubItems && item.subItems?.some(sub => pathname === sub.href));

                    if (hasSubItems && item.subItems?.some(sub => pathname === sub.href) && !isOpen) {
                        setOpenMenus(prev => ({ ...prev, [item.title]: true }));
                    }

                    return (
                      <li key={itemIdx}>
                        {hasSubItems ? (
                          <>
                            <button 
                              onClick={() => toggleMenu(item.title)}
                              className={`nav-link w-full text-left flex items-center gap-2.5 ${isActive || isOpen ? 'active' : ''}`}
                            >
                              <span className="nav-icon-wrapper">{item.icon}</span>
                              <span className="flex-1">{item.title}</span>
                              <KeyboardArrowRightRounded className={`nav-chevron ${isOpen ? 'rotate-90' : ''}`} fontSize="small" />
                            </button>
                            <ul className={`nav-submenu ${isOpen ? 'show' : ''}`}>
                              <div>
                                {item.subItems?.map((sub, sIdx) => (
                                  <li key={sIdx}>
                                    <Link 
                                      href={sub.href} 
                                      className={`nav-sub-link flex items-center gap-2 ${pathname === sub.href ? 'active' : ''}`}
                                    >
                                      {sub.title}
                                    </Link>
                                  </li>
                                ))}
                              </div>
                            </ul>
                          </>
                        ) : (
                          <Link 
                            href={item.href || '#'} 
                            className={`nav-link flex items-center gap-2.5 ${isActive ? 'active' : ''}`}
                          >
                            <span className="nav-icon-wrapper">{item.icon}</span>
                            <span className="flex-1">{item.title}</span>
                            {item.badge && (
                                <span className={`px-2 py-0.5 text-[9px] font-bold text-smoke-200 rounded-lg ${item.badge === 'VIP' ? 'bg-ocean-500' : 'bg-brand-500'}`}>
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

      <div className="p-4 border-t border-brand-500/5 space-y-4">
        <Link href="/help" className="block">
          <div className="bg-cloud-200 p-4 rounded-[24px] hover:bg-cloud-300 transition-colors cursor-pointer group/support">
              <div className="flex items-center gap-4">
                  <div className="bg-ocean-500/10 p-2.5 rounded-xl group-hover/support:bg-ocean-500 group-hover/support:text-smoke-200 transition-all">
                      <ContactSupportRounded className="text-ocean-500 group-hover/support:text-smoke-200" fontSize="small" />
                  </div>
                  <div className="flex flex-col">
                      <span className="text-xs font-black text-brand-500">Need Help?</span>
                      <span className="text-[10px] text-brand-500/40 font-bold mt-0.5">Contact support</span>
                  </div>
              </div>
          </div>
        </Link>
        
        <button 
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-3 px-4 py-3.5 w-full text-sm text-red-500 font-bold rounded-2xl hover:bg-red-500/5 active:scale-[0.98] transition-all duration-300 group ring-red-500/20 focus:ring-4"
        >
          <div className="p-2 rounded-xl bg-red-500/10 group-hover:bg-red-500 group-hover:text-smoke-200 transition-all duration-300">
            <LogoutRounded fontSize="small" />
          </div>
          <span className="font-black">Logout Session</span>
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
