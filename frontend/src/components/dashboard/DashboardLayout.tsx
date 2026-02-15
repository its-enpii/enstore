"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'admin' | 'retail' | 'reseller';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role }) => {
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Initial state based on screen size
    if (window.innerWidth < 1024) {
      setSidebarHidden(true);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    
    // Strict Role Separation
    if (!loading && user) {
      if (user.role === 'admin') {
        if (role !== 'admin') {
          router.push('/admin/dashboard');
        }
      } else if (user.customer_type === 'reseller') {
        if (role !== 'reseller') {
          router.push('/reseller/dashboard');
        }
      } else { // retail / customer
        if (role !== 'retail') {
          router.push('/dashboard');
        }
      }
    }
  }, [user, loading, role, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-smoke-200 flex items-center justify-center transition-colors duration-300">
        <div className="w-10 h-10 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={`min-h-screen ${sidebarHidden ? 'sidebar-hidden' : ''}`}>
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-brand-900/50 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${sidebarHidden ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}
        onClick={() => setSidebarHidden(true)}
      />

      <div className="min-h-screen bg-cloud-50 transition-colors duration-300">
        {/* Sidebar */}
        <aside className="layout-sidebar bg-smoke-200">
          <Sidebar role={role} onClose={() => setSidebarHidden(true)} />
        </aside>

        {/* Main Content Area */}
        <div className="layout-content">
          <Navbar onToggleSidebar={() => setSidebarHidden(!sidebarHidden)} />
          
          <main className="flex-1 overflow-x-hidden p-4 lg:p-8 relative">
            <div className="container mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {children}
              </motion.div>
            </div>
            
            <footer className="mt-auto py-8 text-center border-t border-brand-500/5">
                <p className="text-center text-sm text-brand-500/40 font-bold">
                    &copy; 2026 ENCORE UI &bull; ENSTORE PLATFORM
                </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
