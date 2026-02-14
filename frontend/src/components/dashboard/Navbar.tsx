
import React from 'react';
import { 
  MenuRounded, 
  SearchRounded, 
  NotificationsRounded, 
  MessageRounded, 
  KeyboardArrowDownRounded,
  LightModeRounded,
  DarkModeRounded,
  AccountCircleRounded
} from '@mui/icons-material';

interface NavbarProps {
  onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  // Theme state logic would normally be handled by a ThemeProvider, 
  // but for now we follow the structure of the existing project.
  const [isDark, setIsDark] = React.useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors">
      <div className="h-16 px-4 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleSidebar}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors lg:hidden"
          >
            <MenuRounded className="text-slate-600 dark:text-slate-400" />
          </button>
          
          <button 
            onClick={onToggleSidebar}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors hidden lg:flex"
          >
            <MenuRounded className="text-slate-600 dark:text-slate-400" />
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center relative group max-w-sm w-full">
            <SearchRounded className="absolute left-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fontSize="small" />
            <input 
              type="text" 
              placeholder="Search everything..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 text-sm border-0 rounded-xl focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 transition-all outline-none"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 lg:gap-3">
          
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-400"
          >
            {isDark ? <LightModeRounded fontSize="small" /> : <DarkModeRounded fontSize="small" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-400">
              <NotificationsRounded fontSize="small" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
          </div>

          {/* Messages */}
          <div className="relative hidden sm:block">
            <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-400">
              <MessageRounded fontSize="small" />
              <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-indigo-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-slate-900">
                3
              </span>
            </button>
          </div>

          <div className="h-8 w-px bg-slate-100 dark:border-slate-800 mx-1"></div>

          {/* User Profile */}
          <button className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all group">
            <div className="relative">
              <div className="w-9 h-9 overflow-hidden rounded-full ring-2 ring-white dark:ring-slate-800 group-hover:ring-indigo-200 dark:group-hover:ring-indigo-900 transition-all">
                <img 
                  src="https://ui-avatars.com/api/?name=User&background=6366f1&color=fff" 
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">John Doe</p>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">Reseller</p>
            </div>
            <KeyboardArrowDownRounded className="text-slate-400 group-hover:text-indigo-500 group-hover:rotate-180 transition-all" fontSize="small" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
