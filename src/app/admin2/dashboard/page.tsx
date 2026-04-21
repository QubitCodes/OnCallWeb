'use client';

import { motion } from 'framer-motion';
import { Users, Activity, Phone, Settings } from 'lucide-react';
// import dynamic from 'next/dynamic';
// const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const stats = [
  { name: 'Total Users', value: '1,245', icon: Users, color: 'bg-blue-500' },
  { name: 'Active Services', value: '48', icon: Activity, color: 'bg-green-500' },
  { name: 'New Leads', value: '12', icon: Phone, color: 'bg-yellow-500' },
  { name: 'System Alerts', value: '0', icon: Settings, color: 'bg-gray-500' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white dark:bg-[#1e1e48] rounded-2xl p-6 shadow-card flex items-center space-x-4 border border-secondary-600/10 dark:border-white/5"
            >
              <div className={`p-4 rounded-xl ${stat.color} bg-opacity-10 dark:bg-opacity-20`}>
                <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-text-light dark:text-secondary-400">
                  {stat.name}
                </p>
                <p className="text-2xl font-bold text-primary dark:text-secondary-100">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white dark:bg-[#1e1e48] rounded-2xl p-6 shadow-card border border-secondary-600/10 dark:border-white/5 min-h-[400px] flex items-center justify-center"
        >
          <p className="text-text-light dark:text-secondary-400">Chart Placeholder (Activity Overview)</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white dark:bg-[#1e1e48] rounded-2xl p-6 shadow-card border border-secondary-600/10 dark:border-white/5 min-h-[400px] flex items-center justify-center"
        >
          <p className="text-text-light dark:text-secondary-400">Chart Placeholder (Lead Sources)</p>
        </motion.div>
      </div>
    </div>
  );
}
