
import React from 'react';
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
  NotificationsRounded,
  LocalOfferRounded,
  AssessmentRounded,
  CategoryRounded,
  SyncRounded,
  PaymentRounded,
  ViewCarouselRounded,
  RateReviewRounded,
  CloseRounded
} from '@mui/icons-material';

interface MenuItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
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

  const getMenu = (): MenuSection[] => {
    const adminMenu: MenuSection[] = [
      {
        header: 'Overview',
        items: [
          { title: 'Dashboard', href: '/admin/dashboard', icon: <DashboardRounded fontSize="small" /> },
          { title: 'Analytics', href: '/admin/reports/sales', icon: <AssessmentRounded fontSize="small" /> },
        ]
      },
      {
        header: 'Management',
        items: [
          { title: 'Transactions', href: '/admin/transactions', icon: <ShoppingCartRounded fontSize="small" /> },
          { title: 'Products', href: '/admin/products', icon: <CategoryRounded fontSize="small" /> },
          { title: 'Users', href: '/admin/users', icon: <PeopleRounded fontSize="small" /> },
          { title: 'Payments', href: '/admin/payments', icon: <PaymentRounded fontSize="small" /> },
          { title: 'Balances', href: '/admin/balances', icon: <AccountBalanceWalletRounded fontSize="small" /> },
        ]
      },
      {
        header: 'Content & System',
        items: [
          { title: 'Banners', href: '/admin/banners', icon: <ViewCarouselRounded fontSize="small" /> },
          { title: 'Vouchers', href: '/admin/vouchers', icon: <LocalOfferRounded fontSize="small" /> },
          { title: 'Settings', href: '/admin/settings', icon: <SettingsRounded fontSize="small" /> },
          { title: 'Activity Logs', href: '/admin/logs', icon: <HistoryRounded fontSize="small" /> },
        ]
      }
    ];

    const retailMenu: MenuSection[] = [
      {
        header: 'Dashboard',
        items: [
          { title: 'Overview', href: '/dashboard', icon: <DashboardRounded fontSize="small" /> },
          { title: 'Profile', href: '/profile', icon: <PeopleRounded fontSize="small" /> },
        ]
      },
      {
        header: 'Transactions',
        items: [
          { title: 'History', href: '/transactions', icon: <HistoryRounded fontSize="small" /> },
          { title: 'Favorites', href: '/favorites', icon: <LocalOfferRounded fontSize="small" /> },
          { title: 'Vouchers', href: '/vouchers', icon: <LocalOfferRounded fontSize="small" /> },
        ]
      },
      {
        header: 'Account',
        items: [
          { title: 'Settings', href: '/settings', icon: <SettingsRounded fontSize="small" /> },
          { title: 'Notifications', href: '/notifications', icon: <NotificationsRounded fontSize="small" />, badge: '3', badgeColor: 'bg-indigo-500' },
        ]
      }
    ];

    const resellerMenu: MenuSection[] = [
      {
        header: 'Dashboard',
        items: [
          { title: 'Overview', href: '/reseller/dashboard', icon: <DashboardRounded fontSize="small" /> },
          { title: 'Balance', href: '/reseller/balance', icon: <AccountBalanceWalletRounded fontSize="small" /> },
        ]
      },
      {
        header: 'Sales & Reports',
        items: [
          { title: 'Transaction History', href: '/transactions', icon: <HistoryRounded fontSize="small" /> },
          { title: 'Sales Report', href: '/reseller/reports/sales', icon: <AssessmentRounded fontSize="small" /> },
          { title: 'Price List', href: '/reseller/prices', icon: <CategoryRounded fontSize="small" /> },
        ]
      },
      {
        header: 'Finances',
        items: [
          { title: 'Top Up', href: '/reseller/topup', icon: <ShoppingCartRounded fontSize="small" /> },
          { title: 'Withdrawal', href: '/reseller/withdrawal', icon: <AccountBalanceWalletRounded fontSize="small" /> },
          { title: 'Mutations', href: '/reseller/balance/history', icon: <HistoryRounded fontSize="small" /> },
        ]
      },
      {
        header: 'Account',
        items: [
          { title: 'Settings', href: '/reseller/settings', icon: <SettingsRounded fontSize="small" /> },
          { title: 'Profile', href: '/profile', icon: <PeopleRounded fontSize="small" /> },
        ]
      }
    ];

    if (role === 'admin') return adminMenu;
    if (role === 'reseller') return resellerMenu;
    return retailMenu;
  };

  const menuSections = getMenu();

  return (
    <aside className="w-64 h-full bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 flex flex-col transition-all duration-300">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-700 shrink-0">
        <div className="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-indigo-400 tracking-tight">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
            <ShoppingCartRounded fontSize="medium" />
          </div>
          <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Enstore
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden ml-auto p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
            <CloseRounded fontSize="small" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              {section.header}
            </h3>
            <ul className="space-y-0.5">
              {section.items.map((item, itemIdx) => {
                const isActive = pathname === item.href;
                return (
                  <li key={itemIdx}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group
                        ${isActive 
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-indigo-400'}
                      `}
                    >
                      <span className={`${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'} transition-colors`}>
                        {item.icon}
                      </span>
                      <span className="text-sm font-medium flex-1">{item.title}</span>
                      {item.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${item.badgeColor || 'bg-red-500'}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-700 shrink-0">
        <button
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group"
        >
          <LogoutRounded fontSize="small" className="text-red-500 group-hover:rotate-12 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
