
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
    { id: 2, title: 'System Update', desc: 'Platform maintenance completed.', time: '1h ago', icon: <InfoRounded className="text-blue-500" /> },
    { id: 3, title: 'Price Alert', desc: 'Diamonds price dropped!', time: '5h ago', icon: <WarningRounded className="text-amber-500" /> },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-800/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-700/50 transition-colors duration-300">
      <div className="h-16 px-4 lg:px-6 flex items-center justify-between">
        
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleSidebar}
            className="p-2 hover:bg-indigo-50 dark:hover:bg-slate-700/50 rounded-xl transition-all duration-300 group"
          >
            <MenuRounded className="text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
          </button>

          <div className="hidden lg:flex items-center flex-1 max-w-sm ml-4">
            <div className="relative w-full group">
                <div className="absolute inset-0 bg-indigo-400/10 rounded-xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></div>
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-600 group-hover:border-indigo-300 dark:group-hover:border-indigo-500 transition-all duration-300">
                    <SearchRounded className="ml-3 text-slate-400 group-hover:text-indigo-500 transition-colors" fontSize="small" />
                    <input 
                        type="text" 
                        placeholder="Search everything..." 
                        className="flex-1 px-3 py-2 text-sm bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                    />
                </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          
          <button 
            onClick={toggleTheme}
            className="p-2.5 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-xl transition-all duration-300 text-slate-600 dark:text-slate-400 hover:text-amber-500"
          >
            {isDark ? <LightModeRounded fontSize="small" /> : <DarkModeRounded fontSize="small" />}
          </button>

          <div className="relative">
            <button 
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-xl transition-all duration-300 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <NotificationsRounded fontSize="small" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-800"></span>
            </button>

            <AnimatePresence>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)}></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-20"
                  >
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                      <h4 className="font-bold text-slate-900 dark:text-white">Notifications</h4>
                      <Link href="/notifications" className="text-[10px] text-indigo-600 font-bold uppercase hover:underline">Mark all read</Link>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="p-4 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group">
                           <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0">
                              {notif.icon}
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{notif.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{notif.desc}</p>
                              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tight">{notif.time}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="h-8 w-px bg-slate-100 dark:bg-slate-700 mx-1"></div>

          <div className="relative">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group"
            >
              <div className="relative">
                <img 
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=6366f1&color=fff`} 
                  alt="Avatar"
                  className="w-9 h-9 rounded-full ring-2 ring-white dark:ring-slate-700 shadow-sm"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></span>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none truncate max-w-[100px]">{user?.name}</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">{user?.role}</p>
              </div>
              <KeyboardArrowDownRounded className={`text-slate-400 transition-all ${profileOpen ? 'rotate-180' : ''}`} fontSize="small" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)}></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-20"
                  >
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-center">
                       <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=6366f1&color=fff`} className="w-14 h-14 rounded-full mx-auto mb-2 border-2 border-white shadow-sm" />
                       <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                       <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    </div>
                    
                    <div className="p-2">
                       <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                          <PersonRounded fontSize="small" className="text-slate-400" />
                          <span>My Profile</span>
                       </button>
                       <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                          <SettingsRounded fontSize="small" className="text-slate-400" />
                          <span>Settings</span>
                       </button>
                       <button 
                         onClick={logout}
                         className="w-full mt-1 flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
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
