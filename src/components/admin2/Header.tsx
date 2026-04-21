'use client';

import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { Moon, Sun, Menu, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useHeaderActionSlot } from '@/context/HeaderActionContext';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { headerActions, previewLink } = useHeaderActionSlot();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname === '/admin2/login') return null;

  /** Subtitle map keyed by the route segment */
  const subtitleMap: Record<string, string> = {
    dashboard: 'Overview of your platform activity',
    services: 'Manage your health and care services',
    contacts: 'View and manage contact enquiries',
    admins: 'Manage admin user accounts',
    settings: 'Platform configuration and preferences',
    profile: 'Manage your account settings',
  };

  return (
    <header className="h-20 bg-white dark:bg-primary border-b border-gray-200 dark:border-white/10 shadow-sm flex items-center justify-between px-4 md:px-8 z-10">
      <div className="flex items-center">
        <button className="md:hidden p-2 text-text-dark dark:text-secondary-100 hover:bg-secondary-100 dark:hover:bg-primary-700 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden md:block">
          <h2 className="text-xl font-semibold text-primary dark:text-secondary-100 capitalize">
            {pathname.split('/')[2] || 'Dashboard'}
          </h2>
          {subtitleMap[pathname.split('/')[2]] && (
            <p className="text-xs text-text-light dark:text-secondary-400 mt-0.5">{subtitleMap[pathname.split('/')[2]]}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {headerActions}
        {mounted && (
          <>
            <Link
              href={previewLink || '/'}
              target="_blank"
              className="p-2.5 bg-secondary-100 dark:bg-primary-700 text-text-dark dark:text-accent rounded-full hover:scale-110 transition-transform shadow-inner flex items-center justify-center"
              title="View on Frontend"
            >
              <Globe className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 bg-secondary-100 dark:bg-primary-700 text-text-dark dark:text-accent rounded-full hover:scale-110 transition-transform shadow-inner flex items-center justify-center"
              title="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </>
        )}
      </div>
    </header>
  );
}
