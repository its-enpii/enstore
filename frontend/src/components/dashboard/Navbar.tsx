"use client";

import React, { useState, useEffect } from 'react';
import { 
  MenuRounded, 
  SearchRounded, 
  NotificationsRounded, 
  KeyboardArrowDownRounded,
  LightModeRounded,
  DarkModeRounded,
  LogoutRounded,
  PersonRounded,
  SettingsRounded,
  CheckCircleRounded,
  InfoRounded,
  WarningRounded
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

interface NavbarProps {
  onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Sync state with DOM class on mount
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const notifications = [
    { id: 1, title: 'Transaction Success', desc: 'Your ML BB topup was successful.', time: '2m ago', icon: <CheckCircleRounded className="text-emerald-500" /> },
    { id: 2, title: 'System Update', desc: 'Platform maintenance completed.', time: '1h ago', icon: <InfoRounded className="text-ocean-500" /> },
    { id: 3, title: 'Price Alert', desc: 'Diamonds price dropped!', time: '5h ago', icon: <WarningRounded className="text-brand-500" /> },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-smoke-200/90 dark:bg-brand-900/95 backdrop-blur-md border-b border-brand-500/5 transition-colors duration-300">
      <div className="h-20 px-4 lg:px-8 flex items-center justify-between">
        
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleSidebar}
            className="p-2 hover:bg-ocean-500/5 dark:hover:bg-ocean-500/10 rounded-xl transition-all duration-300 group"
          >
            <MenuRounded className="text-brand-500/40 group-hover:text-ocean-500 transition-colors" />
          </button>

          <div className="hidden lg:flex items-center flex-1 max-w-sm ml-4">
            <div className="relative w-full group">
                <div className="absolute inset-0 bg-ocean-500/5 rounded-xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></div>
                <div className="relative flex items-center bg-cloud-200 dark:bg-brand-800 rounded-xl border border-brand-500/5 group-hover:border-ocean-500/30 transition-all duration-300">
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
          
          <button 
            onClick={toggleTheme}
            className="p-2.5 hover:bg-brand-500/5 rounded-xl transition-all duration-300 text-brand-500/40 hover:text-brand-500"
          >
            {isDark ? <LightModeRounded fontSize="small" /> : <DarkModeRounded fontSize="small" />}
          </button>

          <div className="relative">
            <button 
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2.5 hover:bg-ocean-500/5 rounded-xl transition-all duration-300 text-brand-500/40 hover:text-ocean-500"
            >
              <NotificationsRounded fontSize="small" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-ocean-500 rounded-full border-2 border-smoke-200 dark:border-brand-900"></span>
            </button>

            <AnimatePresence>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)}></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-smoke-200 dark:bg-brand-900 rounded-[24px] border border-brand-500/5 overflow-hidden z-20"
                  >
                    <div className="p-4 border-b border-brand-500/5 flex justify-between items-center">
                      <h4 className="font-black text-brand-500">Notifications</h4>
                      <Link href="/notifications" className="text-[10px] text-ocean-500 font-bold uppercase hover:underline">Mark all read</Link>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="p-4 flex gap-4 hover:bg-cloud-200 dark:hover:bg-brand-800 transition-colors cursor-pointer group">
                           <div className="w-10 h-10 rounded-xl bg-cloud-200 dark:bg-brand-800 flex items-center justify-center shrink-0 border border-brand-500/5">
                              {notif.icon}
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-brand-500 truncate">{notif.title}</p>
                              <p className="text-xs text-brand-500/50 line-clamp-2">{notif.desc}</p>
                              <p className="text-[10px] text-brand-500/30 mt-1 uppercase tracking-tight font-bold">{notif.time}</p>
                           </div>
                        </div>
                      ))}
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
                  className="w-10 h-10 rounded-full ring-2 ring-smoke-200 dark:ring-brand-800"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-smoke-200 dark:border-brand-900"></span>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-black text-brand-500 leading-none truncate max-w-[100px]">{user?.name}</p>
                <p className="text-[10px] text-brand-500/40 mt-1 uppercase font-bold tracking-wider">{user?.role}</p>
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
                    className="absolute right-0 mt-2 w-64 bg-smoke-200 dark:bg-brand-900 rounded-[24px] border border-brand-500/5 overflow-hidden z-20"
                  >
                    <div className="p-6 border-b border-brand-500/5 bg-cloud-200/50 dark:bg-brand-800/50 text-center">
                       <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0ea5e9&color=fff`} className="w-16 h-16 rounded-full mx-auto mb-3 border-4 border-smoke-200 dark:border-brand-900" />
                       <p className="text-sm font-black text-brand-500 truncate">{user?.name}</p>
                       <p className="text-xs text-brand-500/40 truncate font-bold">{user?.email}</p>
                    </div>
                    
                    <div className="p-2">
                       <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-brand-500 font-bold hover:bg-cloud-200 dark:hover:bg-brand-800 rounded-xl transition-colors">
                          <PersonRounded fontSize="small" className="text-brand-500/40" />
                          <span>My Profile</span>
                       </button>
                       <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-brand-500 font-bold hover:bg-cloud-200 dark:hover:bg-brand-800 rounded-xl transition-colors">
                          <SettingsRounded fontSize="small" className="text-brand-500/40" />
                          <span>Settings</span>
                       </button>
                       <button 
                         onClick={logout}
                         className="w-full mt-1 flex items-center gap-3 px-4 py-3 text-sm text-red-500 font-bold hover:bg-red-500/5 rounded-xl transition-colors"
                       >
                          <LogoutRounded fontSize="small" />
                          <span>Logout</span>
                       </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
