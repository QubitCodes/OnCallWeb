'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, Eye, Layers, MapPin, CheckSquare, Loader2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useHeaderActions } from '@/context/HeaderActionContext';

function ServicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Bulk Actions State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkModal, setBulkModal] = useState<'status' | 'category' | 'location' | 'delete' | null>(null);
  const [bulkValue, setBulkValue] = useState<any>('');
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

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

  const fetchDependencies = async () => {
    try {
      const token = getCookie('token');
      const [catRes, tplRes] = await Promise.all([
        axios.get('/api/v1/service-categories', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/v1/location-templates', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (catRes.data.status) setCategories(catRes.data.data);
      if (tplRes.data.status) setTemplates(tplRes.data.data);
    } catch (error) {
      console.error('Failed to load dependencies', error);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchDependencies();
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
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete service');
    }
  };

  const handleBulkAction = async () => {
    if (selectedIds.length === 0) return;
    setIsProcessingBulk(true);
    
    let payloadValue = bulkValue;
    if (bulkModal === 'status') {
      payloadValue = bulkValue === 'true';
    }

    try {
      const token = getCookie('token');
      const res = await axios.post('/api/v1/services/bulk-action', {
        action: bulkModal === 'status' ? 'change_status' :
                bulkModal === 'category' ? 'change_category' :
                bulkModal === 'location' ? 'assign_location' : 'delete',
        serviceIds: selectedIds,
        value: payloadValue
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.status) {
        toast.success('Bulk action completed successfully!');
        setBulkModal(null);
        setSelectedIds([]);
        setBulkValue('');
        fetchServices();
      } else {
        toast.error(res.data.message || 'Failed to perform bulk action');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred during bulk action');
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const filteredServices = servicesList.filter((s) => {
    const term = searchTerm.toLowerCase();
    const name = String(s.name || '').toLowerCase();
    const cat = String(s.categoryName || s.category || '').toLowerCase();
    return name.includes(term) || cat.includes(term);
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredServices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredServices.map(s => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
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
    <div className="relative min-h-[calc(100vh-80px)] pb-24">

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
                <th className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5 w-12">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-secondary-600/30 text-accent focus:ring-accent accent-accent cursor-pointer"
                    checked={filteredServices.length > 0 && selectedIds.length === filteredServices.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5">Name</th>
                <th className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5">Category</th>
                <th className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5">Location</th>
                <th className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5">Description</th>
                <th className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5">Status</th>
                <th className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-text-light">Loading services...</td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-text-light">No services found.</td>
                </tr>
              ) : filteredServices.map((service, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={service.id} 
                  className={`hover:bg-secondary-50 dark:hover:bg-[#171738]/50 transition-colors group ${selectedIds.includes(service.id) ? 'bg-accent/5 dark:bg-accent/10' : ''}`}
                >
                  <td className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-secondary-600/30 text-accent focus:ring-accent accent-accent cursor-pointer"
                      checked={selectedIds.includes(service.id)}
                      onChange={() => toggleSelect(service.id)}
                    />
                  </td>
                  <td className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5 font-medium text-text-dark dark:text-secondary-100">{service.name}</td>
                  <td className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5 text-text-light dark:text-secondary-300">{service.categoryName || 'Uncategorized'}</td>
                  <td className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5 text-text-light dark:text-secondary-300">
                    {service.locationTemplateName ? (
                      <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-blue-500" />{service.locationTemplateName}</span>
                    ) : (
                      <span className="text-secondary-400 dark:text-secondary-500 text-xs italic">Unassigned</span>
                    )}
                  </td>
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

      {/* Floating Bulk Actions Toolbar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-40 bg-white dark:bg-[#1e1e48] shadow-2xl border border-secondary-600/20 dark:border-white/10 rounded-2xl p-2 px-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-[90%] sm:w-auto"
          >
            <div className="flex items-center gap-2 px-2 py-1 bg-secondary-100 dark:bg-[#171738] rounded-lg">
              <span className="flex items-center justify-center w-6 h-6 bg-accent text-white text-xs font-bold rounded-md">
                {selectedIds.length}
              </span>
              <span className="text-sm font-semibold text-text-dark dark:text-secondary-100 pr-2">Selected</span>
            </div>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 w-full sm:w-auto">
              <button onClick={() => setBulkModal('status')} className="flex items-center px-3 py-1.5 text-sm font-medium text-text-dark dark:text-secondary-100 hover:bg-secondary-100 dark:hover:bg-[#171738] rounded-lg transition-colors">
                <CheckSquare className="w-4 h-4 mr-1.5 text-success" /> Status
              </button>
              <button onClick={() => setBulkModal('category')} className="flex items-center px-3 py-1.5 text-sm font-medium text-text-dark dark:text-secondary-100 hover:bg-secondary-100 dark:hover:bg-[#171738] rounded-lg transition-colors">
                <Layers className="w-4 h-4 mr-1.5 text-accent" /> Category
              </button>
              <button onClick={() => setBulkModal('location')} className="flex items-center px-3 py-1.5 text-sm font-medium text-text-dark dark:text-secondary-100 hover:bg-secondary-100 dark:hover:bg-[#171738] rounded-lg transition-colors">
                <MapPin className="w-4 h-4 mr-1.5 text-blue-500" /> Location
              </button>
              <div className="w-px h-6 bg-secondary-600/20 dark:bg-white/10 hidden sm:block"></div>
              <button onClick={() => setBulkModal('delete')} className="flex items-center px-3 py-1.5 text-sm font-medium text-error hover:bg-error/10 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4 mr-1.5" /> Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Action Modals */}
      <AnimatePresence>
        {bulkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1e1e48] rounded-2xl shadow-2xl border border-secondary-600/10 dark:border-white/5 w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-secondary-600/10 dark:border-white/5">
                <h3 className="text-lg font-semibold text-text-dark dark:text-secondary-100">
                  {bulkModal === 'status' && 'Change Status'}
                  {bulkModal === 'category' && 'Change Category'}
                  {bulkModal === 'location' && 'Assign Location Template'}
                  {bulkModal === 'delete' && 'Delete Services'}
                </h3>
                <button onClick={() => { setBulkModal(null); setBulkValue(''); }} className="p-1 text-text-light hover:bg-secondary-100 dark:hover:bg-[#171738] rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                {bulkModal === 'status' && (
                  <div className="space-y-4">
                    <p className="text-sm text-text-light">Select the new status for {selectedIds.length} selected services:</p>
                    <select 
                      value={bulkValue} 
                      onChange={(e) => setBulkValue(e.target.value)}
                      className="w-full px-4 py-2.5 bg-secondary-50 dark:bg-[#171738] border border-secondary-600/20 dark:border-white/10 rounded-xl outline-none text-text-dark dark:text-secondary-100"
                    >
                      <option value="">Select Status</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                )}

                {bulkModal === 'category' && (
                  <div className="space-y-4">
                    <p className="text-sm text-text-light">Assign a new category for {selectedIds.length} selected services:</p>
                    <select 
                      value={bulkValue} 
                      onChange={(e) => setBulkValue(e.target.value)}
                      className="w-full px-4 py-2.5 bg-secondary-50 dark:bg-[#171738] border border-secondary-600/20 dark:border-white/10 rounded-xl outline-none text-text-dark dark:text-secondary-100"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {bulkModal === 'location' && (
                  <div className="space-y-4">
                    <p className="text-sm text-text-light">Assign a location template for {selectedIds.length} selected services. This will overwrite any existing locations for these services.</p>
                    <select 
                      value={bulkValue} 
                      onChange={(e) => setBulkValue(e.target.value)}
                      className="w-full px-4 py-2.5 bg-secondary-50 dark:bg-[#171738] border border-secondary-600/20 dark:border-white/10 rounded-xl outline-none text-text-dark dark:text-secondary-100"
                    >
                      <option value="">No Template (Clear Locations)</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {bulkModal === 'delete' && (
                  <div className="space-y-4">
                    <p className="text-sm text-error bg-error/10 p-3 rounded-lg border border-error/20">
                      <strong>Warning:</strong> You are about to delete {selectedIds.length} selected services. This action will hide them from public view.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-secondary-50 dark:bg-[#171738]/50 flex justify-end space-x-3">
                <button 
                  onClick={() => { setBulkModal(null); setBulkValue(''); }}
                  className="px-4 py-2 text-sm font-medium text-text-light hover:text-text-dark dark:hover:text-secondary-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleBulkAction}
                  disabled={isProcessingBulk || (bulkModal !== 'delete' && bulkModal !== 'location' && bulkValue === '')}
                  className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed ${
                    bulkModal === 'delete' ? 'bg-error hover:bg-red-600 shadow-error/30' : 'bg-accent hover:bg-[#34a4cf] shadow-accent/30'
                  }`}
                >
                  {isProcessingBulk && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {bulkModal === 'delete' ? 'Delete Services' : 'Apply Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
