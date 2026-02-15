"use client";

import React, { useState } from 'react';
import { 
  MenuRounded, 
  SearchRounded, 
  NotificationsRounded, 
  KeyboardArrowDownRounded,
  LogoutRounded,
  PersonRounded,
  SettingsRounded,
  CheckCircleRounded,
  InfoRounded,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardConfirmDialog from './DashboardConfirmDialog';

interface NavbarProps {
  onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const notifications = [
    { 
      id: 1, 
      title: 'Transaction Success', 
      desc: 'Mobile Legends 86 Diamonds successful.', 
      time: '2m ago', 
      icon: <CheckCircleRounded className="text-emerald-500" />,
      href: '/reseller/transactions/ENMD12345/invoice' // Example code
    },
    { 
      id: 2, 
      title: 'System Update', 
      desc: 'New payment methods added to the platform.', 
      time: '1h ago', 
      icon: <InfoRounded className="text-ocean-500" /> 
    },
    { 
      id: 3, 
      title: 'Top Up Success', 
      desc: 'Balance Rp 100.000 has been added.', 
      time: '5h ago', 
      icon: <CheckCircleRounded className="text-emerald-500" />,
      href: '/reseller/transactions/TPUP999/invoice'
    },
  ];

  const handleNotifClick = (href?: string) => {
    setNotifOpen(false);
    if (href) {
      router.push(href);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-smoke-200/90 backdrop-blur-md border-b border-brand-500/5 transition-colors">
      <div className="h-20 px-4 lg:px-8 flex items-center justify-between">
        
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleSidebar}
            className="p-2 hover:bg-ocean-500/5 rounded-xl transition-all duration-300 group"
          >
            <MenuRounded className="text-brand-500/40 group-hover:text-ocean-500 transition-colors" />
          </button>

          <div className="hidden lg:flex items-center flex-1 max-w-sm ml-4">
            <div className="relative w-full group">
                <div className="absolute inset-0 bg-ocean-500/5 rounded-xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></div>
                <div className="relative flex items-center bg-cloud-200 rounded-xl border border-brand-500/5 group-hover:border-ocean-500/30 transition-all duration-300">
                    <SearchRounded className="ml-3 text-brand-500/30 group-hover:text-ocean-500 transition-colors" fontSize="small" />
                    <input 
                        type="text" 
                        placeholder="Search everything..." 
                        className="flex-1 px-3 py-3 text-sm bg-transparent outline-none text-brand-500 placeholder:text-brand-500/30 font-medium"
                    />
                </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          
          <div className="relative">
            <button 
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2.5 hover:bg-ocean-500/5 rounded-xl transition-all duration-300 text-brand-500/40 hover:text-ocean-500"
            >
              <NotificationsRounded fontSize="small" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-ocean-500 rounded-full border-2 border-smoke-200"></span>
            </button>

            <AnimatePresence>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)}></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-smoke-200 rounded-[28px] border border-brand-500/5 shadow-xl shadow-brand-500/5 overflow-hidden z-20"
                  >
                    <div className="p-5 border-b border-brand-500/5 flex justify-between items-center bg-cloud-200/20">
                      <h4 className="font-black text-brand-500">Notifications</h4>
                      <button className="text-[10px] text-ocean-500 font-bold hover:underline">Mark all read</button>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                      {notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          onClick={() => handleNotifClick(notif.href)}
                          className="p-4 flex gap-4 hover:bg-cloud-200 transition-colors cursor-pointer group border-b border-brand-500/5 last:border-0"
                        >
                           <div className="w-12 h-12 rounded-2xl bg-cloud-200 flex items-center justify-center shrink-0 border border-brand-500/5 group-hover:scale-110 transition-transform">
                              {notif.icon}
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-brand-500 truncate">{notif.title}</p>
                              <p className="text-xs text-brand-500/50 line-clamp-2 mt-0.5">{notif.desc}</p>
                              <p className="text-[10px] text-brand-500/30 mt-1 font-black">{notif.time}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-cloud-200/20 text-center">
                        <button onClick={() => setNotifOpen(false)} className="text-xs font-black text-brand-500/40 hover:text-ocean-500 transition-colors">Close Notification</button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="h-8 w-px bg-brand-500/10 mx-2"></div>

          <div className="relative">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-ocean-500/5 transition-all group"
            >
              <div className="relative">
                <img 
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0ea5e9&color=fff`} 
                  alt="Avatar"
                  className="w-10 h-10 rounded-full ring-2 ring-smoke-200"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-smoke-200"></span>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-black text-brand-500 leading-none truncate max-w-[100px]">{user?.name}</p>
                <p className="text-[10px] text-brand-500/40 mt-1 font-bold">{user?.role}</p>
              </div>
              <KeyboardArrowDownRounded className={`text-brand-500/30 transition-all ${profileOpen ? 'rotate-180' : ''}`} fontSize="small" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)}></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-72 bg-smoke-200 rounded-[28px] border border-brand-500/5 shadow-xl shadow-brand-500/5 overflow-hidden z-20"
                  >
                    {/* Profile Header */}
                    <div className="p-8 pb-6 text-center">
                       <div className="relative inline-block mb-4">
                          <div className="w-20 h-20 rounded-full bg-ocean-500 flex items-center justify-center text-2xl font-black text-smoke-100 ring-4 ring-smoke-200">
                             {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'EO'}
                          </div>
                       </div>
                       <h4 className="text-base font-black text-brand-500">{user?.name}</h4>
                       <p className="text-xs text-brand-500/40 font-bold mt-1">{user?.email}</p>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="px-3 pb-4 pt-2 border-t border-brand-500/5 transition-colors">
                       <Link 
                          href={user?.role === 'admin' ? '/admin/profile' : '/reseller/settings?tab=profile'} 
                          className="flex items-center gap-4 px-5 py-4 text-brand-500 hover:bg-cloud-200 rounded-2xl transition-all group"
                          onClick={() => setProfileOpen(false)}
                       >
                          <PersonRounded className="text-brand-500/30 group-hover:text-ocean-500 transition-colors" />
                          <span className="text-sm font-black">My Profile</span>
                       </Link>
                       <Link 
                          href={user?.role === 'admin' ? '/admin/settings' : '/reseller/settings?tab=security'}
                          className="flex items-center gap-4 px-5 py-4 text-brand-500 hover:bg-cloud-200 rounded-2xl transition-all group"
                          onClick={() => setProfileOpen(false)}
                       >
                          <SettingsRounded className="text-brand-500/30 group-hover:text-ocean-500 transition-colors" />
                          <span className="text-sm font-black">Settings</span>
                       </Link>
                       
                       <div className="my-2 h-px bg-brand-500/5 mx-4"></div>

                       <button 
                         onClick={() => { setProfileOpen(false); setShowLogoutConfirm(true); }}
                         className="w-full flex items-center gap-4 px-5 py-4 text-red-500 hover:bg-red-500/5 rounded-2xl transition-all group"
                       >
                          <LogoutRounded className="text-red-500/40 group-hover:text-red-500 transition-colors" />
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
