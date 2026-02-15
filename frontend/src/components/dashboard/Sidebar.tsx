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
        { title: 'Dashboard', icon: <DashboardRounded />, href: '/admin/dashboard' },
        { 
          title: 'Analytics', 
          icon: <AutoGraphRounded />,
          subItems: [
              { title: 'Sales Reports', href: '/admin/reports/sales' },
              { title: 'User Growth', href: '/admin/reports/users' },
              { title: 'Product Stats', href: '/admin/reports/products' },
              { title: 'Balance Reports', href: '/admin/reports/balance' },
              { title: 'Payment Methods', href: '/admin/reports/payments' }
          ]
        },
      ]
    },
    {
      header: 'Management',
      items: [
        { title: 'Transactions', href: '/admin/transactions', icon: <ReceiptLongRounded />, badge: 'New' },
        { 
          title: 'Categories & Products', 
          icon: <GamepadRounded />,
          subItems: [
              { title: 'Categories', href: '/admin/categories' },
              { title: 'Products/Games', href: '/admin/products' },
          ]
        },
        { title: 'Users & Customers', href: '/admin/users', icon: <PeopleRounded /> },
      ]
    },
    {
      header: 'System & UI',
      items: [
        { title: 'Platform Settings', href: '/admin/settings', icon: <SettingsRounded /> },
        { title: 'Activity Logs', href: '/admin/logs', icon: <HistoryRounded /> },
      ]
    },
  ] : role === 'reseller' ? [
    {
      header: 'Reseller Panel',
      items: [
        { title: 'Dashboard', href: '/reseller/dashboard', icon: <DashboardRounded /> },
        { 
          title: 'My Wallet', 
          icon: <AccountBalanceWalletRounded />,
          subItems: walletSubItems
        },
      ]
    },
    {
      header: 'Purchase & Sales',
      items: [
        { title: 'Game Services', href: '/services', icon: <StorefrontRounded />, badge: 'VIP' },
        { title: 'Transaction History', href: '/reseller/transactions', icon: <ReceiptLongRounded /> },
        { title: 'Special Price List', href: '/reseller/prices', icon: <LocalOfferRounded />, badge: 'Special' },
      ]
    },
    {
      header: 'Account',
      items: [
        { title: 'My Profile', href: '/reseller/profile', icon: <PeopleRounded /> },
      ]
    }
  ] : [
    {
      header: 'Customer Menu',
      items: [
        { title: 'Dashboard', href: '/dashboard', icon: <DashboardRounded /> },
        {
          title: 'My Wallet',
          icon: <AccountBalanceWalletRounded />,
          subItems: walletSubItems
        },
      ]
    },
    {
      header: 'Shopping',
      items: [
        { title: 'Game Services', href: '/services', icon: <StorefrontRounded /> },
        { title: 'Transaction History', href: '/dashboard/transactions', icon: <ReceiptLongRounded /> },
      ]
    },
    {
      header: 'Account',
      items: [
        { title: 'My Profile', href: '/dashboard/profile', icon: <PeopleRounded /> },
      ]
    }
  ];

  return (
    <>
      <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-700 shrink-0">
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
                <div className="px-3.5 py-2.5 mt-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
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

                    // Encore UI Style Mappings
                    const linkBaseClass = "w-full text-left flex items-center gap-2 px-3.5 py-2.5 text-sm font-normal rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer group";
                    const linkActiveClass = "bg-transparent font-bold text-ocean-500 dark:text-ocean-400";
                    const linkInactiveClass = "text-slate-700 dark:text-slate-300"; 
                    
                    const iconClass = `text-lg mr-1.5 transition-colors duration-200 ${isActive || isOpen ? 'text-ocean-500 dark:text-ocean-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`;
                    const chevronClass = `ml-auto text-sm transition-transform duration-200 ${isOpen ? 'rotate-90' : ''} ${isActive || isOpen ? 'text-ocean-500 dark:text-ocean-400' : 'text-slate-400 dark:text-slate-500'}`;

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
                              <KeyboardArrowRightRounded className={chevronClass} fontSize="inherit" />
                            </button>
                            <ul className={`grid transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                              <div className="min-h-0">
                                {item.subItems?.map((sub, sIdx) => {
                                  const isSubActive = pathname === sub.href;
                                  return (
                                    <li key={sIdx}>
                                      <Link 
                                        href={sub.href} 
                                        className={`block px-3.5 py-2.5 pl-9 text-sm rounded-xl transition-colors
                                          ${isSubActive 
                                            ? 'text-ocean-500 dark:text-ocean-400 font-medium' 
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'}`}
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
                            href={item.href || '#'} 
                            className={`${linkBaseClass} ${isActive ? linkActiveClass : linkInactiveClass}`}
                          >
                            <span className={iconClass}>{item.icon}</span>
                            <span className="flex-1">{item.title}</span>
                            {item.badge && (
                                <span className={`px-2 py-0.5 text-[10px] font-bold text-white rounded-lg ${item.badge === 'VIP' ? 'bg-ocean-500' : 'bg-brand-500'}`}>
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

      <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
        <Link href="/help" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
           <ContactSupportRounded className="text-lg text-slate-400 dark:text-slate-500" fontSize="inherit" />
           <span className="font-medium">Help center</span>
        </Link>
        
        <button 
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
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
