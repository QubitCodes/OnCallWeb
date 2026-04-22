'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, Users, Phone, LogOut, ChevronUp, User, Shield, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const navItems = [
  { name: 'Dashboard', href: '/admin2/dashboard', icon: LayoutDashboard },
  { name: 'Admins', href: '/admin2/admins', icon: Shield },
  { name: 'Services', href: '/admin2/services', icon: Settings },
  { name: 'Location Templates', href: '/admin2/location-templates', icon: MapPin },
  { name: 'Contacts', href: '/admin2/contacts', icon: Phone },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminRole, setAdminRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);


  /** Fetch the logged-in admin's data on mount */
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
        const token = match ? match[2] : '';
        if (!token) return;

        const res = await axios.get('/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status && res.data.data) {
          setAdminName(res.data.data.fullName || res.data.data.full_name || '');
          setAdminRole(res.data.data.role || '');
        }
      } catch {
        // Silently fail — sidebar should not kick the user out
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmin();
  }, []);

  if (pathname === '/admin2/login') return null;

  /** Derive the avatar initial from the fetched name */
  const avatarInitial = adminName ? adminName.charAt(0).toUpperCase() : 'A';

  /** Format role for display (e.g. super_admin → Super Admin) */
  const displayRole = adminRole
    ? adminRole.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    : '';

  return (
    <div className="hidden md:flex flex-col w-64 bg-primary text-white border-r border-primary-900 shadow-xl z-20">
      <div className="flex items-center justify-center h-20 border-b border-white/10 p-4">
        <img src="/images/logo.png" alt="OnCall Logo" className="h-full w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-3">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link href={item.href} className="relative block">
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute inset-0 bg-accent rounded-xl"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className={`relative flex items-center px-4 py-3 rounded-xl transition-colors ${isActive
                      ? 'text-white font-semibold'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}>
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="relative p-4 border-t border-white/10">
        <AnimatePresence>
          {isProfileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-primary-800 rounded-xl shadow-xl border border-secondary-600/10 dark:border-white/5 overflow-hidden z-30"
            >
              <div className="p-2 space-y-1">
                <Link
                  href="/admin2/profile"
                  className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-text-dark dark:text-secondary-200 hover:bg-secondary-50 dark:hover:bg-primary-700/50 rounded-lg transition-colors"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <User className="w-4 h-4 mr-3" />
                  My Profile
                </Link>
                <div className="h-px bg-secondary-600/10 dark:bg-white/10 my-1"></div>
                <button
                  onClick={() => {
                    document.cookie = 'token=; Max-Age=0; path=/';
                    window.location.href = '/admin2/login';
                  }}
                  className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-error hover:bg-error/10 dark:hover:bg-error/20 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className="flex items-center justify-between w-full p-2 mb-4 hover:bg-white/10 rounded-xl transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold shadow-md">
              {avatarInitial}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-white">{isLoading ? 'Loading...' : (adminName || 'Admin')}</p>
              <p className="text-xs text-white/70">{displayRole || (isLoading ? '' : 'Administrator')}</p>
            </div>
          </div>
          <ChevronUp className={`w-5 h-5 text-white/70 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        <div className="text-center text-xs text-white/50">
          Designed & Developed by <a href="https://qubit.codes" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Qubit Codes</a>
        </div>
      </div>
    </div>
  );
}

