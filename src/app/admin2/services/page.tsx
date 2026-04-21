'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, Eye } from 'lucide-react';
import ServiceForm from '@/components/admin2/services/ServiceForm';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useHeaderActions } from '@/context/HeaderActionContext';

function ServicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const editId = searchParams.get('id');

  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return '';
  };

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const token = getCookie('token');
      const res = await axios.get('/api/v1/services', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status) {
        setServicesList(res.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the service "${name}"?`)) return;

    try {
      const token = getCookie('token');
      const res = await axios.delete(`/api/v1/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status) {
        toast.success('Service deleted successfully');
        fetchServices();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete service');
    }
  };

  const filteredServices = servicesList.filter((s) => {
    const term = searchTerm.toLowerCase();
    const name = String(s.name || '').toLowerCase();
    const cat = String(s.categoryName || s.category || '').toLowerCase();
    return name.includes(term) || cat.includes(term);
  });

  const closeDrawer = () => {
    router.push('/admin2/services');
  };

  /** Inject the "Add Service" button into the topbar */
  const addButton = useMemo(() => (
    <button
      onClick={() => router.push('/admin2/services/create')}
      className="flex items-center px-4 py-2 bg-accent hover:bg-[#34a4cf] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
    >
      <Plus className="w-4 h-4 mr-1.5" />
      Add Service
    </button>
  ), [router]);
  useHeaderActions(addButton, '/services');

  return (
    <div className="relative min-h-[calc(100vh-80px)]">

      {/* Search and Filters */}
      <div className="bg-white dark:bg-[#1e1e48] p-4 rounded-xl shadow-card border border-secondary-600/10 dark:border-white/5 mb-6 flex items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
          <input 
            type="text" 
            placeholder="Search services..." 
            className="w-full pl-10 pr-4 py-2 bg-secondary-100 dark:bg-[#171738] border border-transparent focus:border-accent rounded-lg outline-none text-text-dark dark:text-secondary-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#1e1e48] rounded-xl shadow-card border border-secondary-600/10 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary-100 dark:bg-[#171738] text-text-dark dark:text-secondary-200 text-sm font-semibold">
                <th className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5">Name</th>
                <th className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5">Category</th>
                <th className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5">Description</th>
                <th className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5">Status</th>
                <th className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-text-light">Loading services...</td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-text-light">No services found.</td>
                </tr>
              ) : filteredServices.map((service, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={service.id} 
                  className="hover:bg-secondary-50 dark:hover:bg-[#171738]/50 transition-colors group"
                >
                  <td className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5 font-medium text-text-dark dark:text-secondary-100">{service.name}</td>
                  <td className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5 text-text-light dark:text-secondary-300">{service.categoryName || 'Uncategorized'}</td>
                  <td className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5 text-text-dark dark:text-secondary-200 truncate max-w-xs" title={service.description}>{service.description || '-'}</td>
                  <td className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      service.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5 text-right">
                    <button 
                      onClick={() => router.push(`/admin2/services/${service.id}`)}
                      className="p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors mr-2"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => router.push(`/admin2/services/${service.id}/edit`)}
                      className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors mr-2"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(service.id, service.name)}
                      className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-text-light">Loading services module...</div>}>
      <ServicesContent />
    </Suspense>
  );
}
