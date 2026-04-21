'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Loader2, ArrowLeft, MapPin, FileText, Edit, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHeaderActions } from '@/context/HeaderActionContext';
import Link from 'next/link';
import { useMemo } from 'react';

export default function ViewServicePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [service, setService] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'locations'>('details');

  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return '';
  };

  useEffect(() => {
    const fetchService = async () => {
      try {
        const token = getCookie('token');
        const res = await axios.get(`/api/v1/services/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.status) {
          setService(res.data.data);
        }
      } catch (error) {
        toast.error('Failed to load service details');
        router.push('/admin2/services');
      } finally {
        setIsLoading(false);
      }
    };
    fetchService();
  }, [id, router]);

  // The "Edit Service" button for the topbar
  const editButton = useMemo(() => {
    if (!service) return null;
    return (
      <Link
        href={`/admin2/services/${id}/edit`}
        className="flex items-center px-4 py-2 bg-accent hover:bg-[#34a4cf] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
      >
        <Edit className="w-4 h-4 mr-1.5" />
        Edit Service
      </Link>
    );
  }, [service, id]);

  // Set the preview link for the topbar globe icon once the service loads
  useHeaderActions(editButton, service?.slug ? `/services/${service.slug}` : undefined);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="max-w-6xl mx-auto pb-12 p-6">
      <div className="flex items-center mb-8">
        <button 
          onClick={() => router.push('/admin2/services')}
          className="mr-4 p-2 hover:bg-secondary-100 dark:hover:bg-primary-700 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-dark dark:text-secondary-200" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-text-dark dark:text-secondary-100 flex items-center">
            {service.name}
            <span className={`ml-4 px-3 py-1 text-sm font-semibold rounded-full ${
              service.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {service.isActive ? 'Active' : 'Inactive'}
            </span>
          </h1>
          <p className="text-text-light dark:text-secondary-300 mt-1">Category: {service.categoryName || 'Uncategorized'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-secondary-600/10 dark:border-white/5 mb-8">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex items-center pb-4 px-6 text-sm font-semibold transition-colors relative ${
            activeTab === 'details' ? 'text-accent' : 'text-text-light hover:text-text-dark dark:hover:text-secondary-200'
          }`}
        >
          <FileText className="w-4 h-4 mr-2" />
          Service Details
          {activeTab === 'details' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`flex items-center pb-4 px-6 text-sm font-semibold transition-colors relative ${
            activeTab === 'locations' ? 'text-accent' : 'text-text-light hover:text-text-dark dark:hover:text-secondary-200'
          }`}
        >
          <MapPin className="w-4 h-4 mr-2" />
          Service Locations
          {activeTab === 'locations' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {[
              { label: 'Short Description', key: 'description', value: service.description },
              { label: 'Full Description', key: 'fullDescription', value: service.fullDescription },
              { label: 'Detailed Description', key: 'detailedDescription', value: service.detailedDescription },
              { label: 'What Is It?', key: 'whatIs', value: service.whatIs },
              { label: 'Typical Visit', key: 'typicalVisit', value: service.typicalVisit },
              { label: 'Benefits', key: 'benefits', value: service.benefits },
              { label: 'Benefits Extended', key: 'benefitsExtended', value: service.benefitsExtended },
              { label: 'Getting Started', key: 'gettingStarted', value: service.gettingStarted }
            ].map((field, idx) => {
              const textValue = field.value || '';
              const charCount = textValue.length;
              const wordCount = textValue.trim() ? textValue.trim().split(/\s+/).length : 0;
              
              return (
                <div key={idx} className="bg-white dark:bg-[#1e1e48] p-6 rounded-xl shadow-card border border-secondary-600/10 dark:border-white/5 relative group">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-lg font-bold text-text-dark dark:text-secondary-100">{field.label}</h2>
                    <Link
                      href={`/admin2/services/${id}/edit#${field.key}`}
                      className="opacity-0 group-hover:opacity-100 p-1.5 bg-secondary-100 hover:bg-secondary-200 dark:bg-primary-700 dark:hover:bg-primary-600 text-text-light dark:text-secondary-300 hover:text-accent rounded-lg transition-all flex items-center"
                      title="Edit this section"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                  </div>
                  <p className="text-text-dark dark:text-secondary-200 whitespace-pre-wrap">{textValue || 'Not provided'}</p>
                  
                  <div className="mt-4 pt-4 border-t border-secondary-600/10 dark:border-white/5 flex items-center justify-end text-xs font-medium text-text-light dark:text-secondary-400">
                    <span className="mr-4">{wordCount} words</span>
                    <span>{charCount} characters</span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {activeTab === 'locations' && (
          <motion.div
            key="locations"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-[#1e1e48] p-12 rounded-xl shadow-card border border-secondary-600/10 dark:border-white/5 text-center"
          >
            <MapPin className="w-16 h-16 text-text-light mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-text-dark dark:text-secondary-100 mb-2">Location Assignment</h2>
            <p className="text-text-light dark:text-secondary-300 max-w-md mx-auto">
              Location assignments for this service will be configured here once the new location module updates are finalized.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
