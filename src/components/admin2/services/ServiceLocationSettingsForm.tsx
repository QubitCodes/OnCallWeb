'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { Loader2, Save } from 'lucide-react';

interface LocationSettingsProps {
  serviceId: string;
  initialData: {
    locationTemplateId?: string | null;
  };
}

export default function ServiceLocationSettingsForm({ serviceId, initialData }: LocationSettingsProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      locationTemplateId: initialData.locationTemplateId || '',
    }
  });

  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return '';
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const token = getCookie('token');
        const res = await axios.get('/api/v1/location-templates', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.status) {
          setTemplates(res.data.data);
        }
      } catch (error) {
        console.error('Failed to load templates');
      }
    };
    fetchTemplates();
  }, []);

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      const token = getCookie('token');
      const res = await axios.put(`/api/v1/services/${serviceId}/locations`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status) {
        toast.success('Location settings updated successfully!');
      } else {
        toast.error(res.data.message || 'Failed to update locations');
      }
    } catch (error) {
      toast.error('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white dark:bg-[#1e1e48] p-6 rounded-xl shadow-card border border-secondary-600/10 dark:border-white/5">
        <h3 className="text-lg font-semibold text-text-dark dark:text-secondary-100 mb-4">Location Settings</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-dark dark:text-secondary-200 mb-2">Location Template (Optional)</label>
          <select
            {...register('locationTemplateId')}
            className="w-full px-4 py-2.5 bg-secondary-50 dark:bg-primary-900 border border-secondary-600/20 dark:border-primary-600/30 rounded-xl focus:ring-2 focus:ring-accent outline-none text-text-dark dark:text-secondary-100 transition-all"
          >
            <option value="">No Template Assigned</option>
            {templates.map((tpl: any) => (
              <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
            ))}
          </select>
          <p className="text-xs text-text-light mt-1">Select a template to inherit its serviced areas. Any customers inside these areas will be allowed to book this service.</p>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center px-6 py-2.5 bg-accent hover:bg-[#34a4cf] text-white font-semibold rounded-xl shadow-lg shadow-accent/30 hover:shadow-accent/50 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
          {isSaving ? 'Saving...' : 'Save Location Settings'}
        </button>
      </div>
    </form>
  );
}
