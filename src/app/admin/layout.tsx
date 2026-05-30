import { AdminProviders } from '@/components/admin2/Providers';
import Sidebar from '@/components/admin2/Sidebar';
import Header from '@/components/admin2/Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';

export default function Admin2Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AdminProviders>
          <div className="flex h-screen bg-[#f8f9fa] dark:bg-[#171738] text-text-dark dark:text-secondary-100 font-sans transition-colors duration-300">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                {children}
              </main>
            </div>
          </div>
          <ToastContainer position="top-right" theme="colored" />
        </AdminProviders>
      </body>
    </html>
  );
}
