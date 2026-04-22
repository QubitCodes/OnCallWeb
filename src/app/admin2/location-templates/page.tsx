'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, Map } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useHeaderActions } from '@/context/HeaderActionContext';

function TemplatesContent() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return '';
  };

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const token = getCookie('token');
      const res = await axios.get('/api/v1/location-templates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status) {
        setTemplates(res.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the template "${name}"?`)) return;

    try {
      const token = getCookie('token');
      const res = await axios.delete(`/api/v1/location-templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status) {
        toast.success('Template deleted successfully');
        fetchTemplates();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete template');
    }
  };

  const filteredTemplates = templates.filter((t) => {
    const term = searchTerm.toLowerCase();
    const name = String(t.name || '').toLowerCase();
    return name.includes(term);
  });

  const addButton = useMemo(() => (
    <button
      onClick={() => router.push('/admin2/location-templates/create')}
      className="flex items-center px-4 py-2 bg-accent hover:bg-[#34a4cf] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
    >
      <Plus className="w-4 h-4 mr-1.5" />
      Create Template
    </button>
  ), [router]);
  useHeaderActions(addButton, '/location-templates');

  return (
    <div className="relative min-h-[calc(100vh-80px)]">
      <div className="bg-white dark:bg-[#1e1e48] p-4 rounded-xl shadow-card border border-secondary-600/10 dark:border-white/5 mb-6 flex items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
          <input 
            type="text" 
            placeholder="Search templates..." 
            className="w-full pl-10 pr-4 py-2 bg-secondary-100 dark:bg-[#171738] border border-transparent focus:border-accent rounded-lg outline-none text-text-dark dark:text-secondary-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e1e48] rounded-xl shadow-card border border-secondary-600/10 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary-100 dark:bg-[#171738] text-text-dark dark:text-secondary-200 text-sm font-semibold">
                <th className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5">Template Name</th>
                <th className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5">Description</th>
                <th className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5">Included Areas</th>
                <th className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-text-light">Loading templates...</td>
                </tr>
              ) : filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-text-light">No templates found.</td>
                </tr>
              ) : filteredTemplates.map((template, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={template.id} 
                  className="hover:bg-secondary-50 dark:hover:bg-[#171738]/50 transition-colors group"
                >
                  <td className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5 font-medium text-text-dark dark:text-secondary-100 flex items-center">
                    <Map className="w-4 h-4 mr-2 text-accent" />
                    {template.name}
                  </td>
                  <td className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5 text-text-light dark:text-secondary-300 truncate max-w-xs">{template.description || '-'}</td>
                  <td className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5 text-text-dark dark:text-secondary-200">
                    {template.areas?.filter((a: any) => a.type === 'include').length || 0} locations
                  </td>
                  <td className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5 text-right">
                    <button 
                      onClick={() => router.push(`/admin2/location-templates/${template.id}/edit`)}
                      className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors mr-2"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(template.id, template.name)}
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

export default function TemplatesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-text-light">Loading templates...</div>}>
      <TemplatesContent />
    </Suspense>
  );
}
