'use client';

import { useForm, useWatch, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { serviceSchema, type ServiceSchema } from '@/schemas/service.schema';
import { toast } from 'react-toastify';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useHeaderActions } from '@/context/HeaderActionContext';

function TextCounter({ control, name }: { control: Control<ServiceSchema>, name: keyof ServiceSchema }) {
  const value = useWatch({ control, name }) as string || '';
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  
  return (
    <div className="mt-2 flex justify-end text-xs text-text-light dark:text-secondary-400 font-medium">
      <span className="mr-3">{wordCount} words</span>
      <span>{charCount} characters</span>
    </div>
  );
}

export default function ServiceForm({ isEdit, editId }: { isEdit: boolean, editId?: string | null }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  const [categories, setCategories] = useState<any[]>([]);

  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return '';
  };
  
  const { register, handleSubmit, reset, watch, control, formState: { errors } } = useForm<ServiceSchema>({
    resolver: zodResolver(serviceSchema) as any,
    defaultValues: {
      isActive: true
    }
  });

  const currentSlug = watch('slug');
  useHeaderActions(null, currentSlug ? `/services/${currentSlug}` : undefined);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/v1/service-categories');
        if (res.data.status) {
          setCategories(res.data.data);
        }
      } catch (error) {
        toast.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isEdit && editId) {
      const fetchService = async () => {
        try {
          const token = getCookie('token');
          const res = await axios.get(`/api/v1/services/${editId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.status && res.data.data) {
            const data = res.data.data;
            reset({
              name: data.name || '',
              slug: data.slug || '',
              category: data.category || '',
              description: data.description || '',
              fullDescription: data.fullDescription || '',
              detailedDescription: data.detailedDescription || '',
              whatIs: data.whatIs || '',
              typicalVisit: data.typicalVisit || '',
              benefits: data.benefits || '',
              benefitsExtended: data.benefitsExtended || '',
              gettingStarted: data.gettingStarted || '',
              isActive: data.isActive !== false,
            });
          }
        } catch (error) {
          toast.error('Failed to load service details');
          router.push('/admin2/services');
        } finally {
          setIsFetching(false);
        }
      };
      fetchService();
    } else {
      setIsFetching(false);
    }
  }, [isEdit, editId, reset, router]);

  // Handle scrolling to hash anchor for section edits
  useEffect(() => {
    if (!isFetching && typeof window !== 'undefined' && window.location.hash) {
      const targetId = window.location.hash.substring(1);
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }, 500);
    }
  }, [isFetching]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const token = getCookie('token');
      if (isEdit && editId) {
        const res = await axios.put(`/api/v1/services/${editId}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.status) {
          toast.success('Service updated successfully!');
          router.push('/admin2/services');
        }
      } else {
        const res = await axios.post('/api/v1/services', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.status) {
          toast.success('Service created successfully!');
          router.push('/admin2/services');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.push('/admin2/services')}
          className="mr-4 p-2 hover:bg-secondary-100 dark:hover:bg-primary-700 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-dark dark:text-secondary-200" />
        </button>
        <h1 className="text-2xl font-bold text-text-dark dark:text-secondary-100">
          {isEdit ? 'Edit Service' : 'Create New Service'}
        </h1>
      </div>

      <div className="bg-white dark:bg-[#1e1e48] p-6 rounded-xl shadow-card border border-secondary-600/10 dark:border-white/5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-dark dark:text-secondary-200 mb-2">Service Name</label>
              <input
                {...register('name')}
                className="w-full px-4 py-2.5 bg-secondary-50 dark:bg-primary-900 border border-secondary-600/20 dark:border-primary-600/30 rounded-xl focus:ring-2 focus:ring-accent outline-none text-text-dark dark:text-secondary-100 transition-all"
                placeholder="e.g. Home Nursing"
              />
              {errors.name && <p className="mt-1 text-sm text-error">{errors.name.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-dark dark:text-secondary-200 mb-2">Slug</label>
              <input
                {...register('slug')}
                className="w-full px-4 py-2.5 bg-secondary-50 dark:bg-primary-900 border border-secondary-600/20 dark:border-primary-600/30 rounded-xl focus:ring-2 focus:ring-accent outline-none text-text-dark dark:text-secondary-100 transition-all"
                placeholder="e.g. home-nursing"
              />
              {errors.slug && <p className="mt-1 text-sm text-error">{errors.slug.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-dark dark:text-secondary-200 mb-2">Category</label>
              <select
                {...register('category')}
                className="w-full px-4 py-2.5 bg-secondary-50 dark:bg-primary-900 border border-secondary-600/20 dark:border-primary-600/30 rounded-xl focus:ring-2 focus:ring-accent outline-none text-text-dark dark:text-secondary-100 transition-all"
              >
                <option value="">Select a category</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-error">{errors.category.message}</p>}
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t border-secondary-600/10 dark:border-white/5">
            <h3 className="text-lg font-semibold text-text-dark dark:text-secondary-100">Content Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-text-dark dark:text-secondary-200 mb-2">Short Description</label>
              <textarea
                id="description"
                {...register('description')}
                rows={3}
                className="w-full px-4 py-2.5 bg-secondary-50 dark:bg-primary-900 border border-secondary-600/20 dark:border-primary-600/30 rounded-xl focus:ring-2 focus:ring-accent outline-none text-text-dark dark:text-secondary-100 transition-all resize-y"
                placeholder="Brief summary..."
              />
              <TextCounter control={control} name="description" />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark dark:text-secondary-200 mb-2">Full Description</label>
              <textarea
                id="fullDescription"
                {...register('fullDescription')}
                rows={4}
                className="w-full px-4 py-2.5 bg-secondary-50 dark:bg-primary-900 border border-secondary-600/20 dark:border-primary-600/30 rounded-xl focus:ring-2 focus:ring-accent outline-none text-text-dark dark:text-secondary-100 transition-all resize-y"
              />
              <TextCounter control={control} name="fullDescription" />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark dark:text-secondary-200 mb-2">Detailed Description</label>
              <textarea
                id="detailedDescription"
                {...register('detailedDescription')}
                rows={4}
                className="w-full px-4 py-2.5 bg-secondary-50 dark:bg-primary-900 border border-secondary-600/20 dark:border-primary-600/30 rounded-xl focus:ring-2 focus:ring-accent outline-none text-text-dark dark:text-secondary-100 transition-all resize-y"
              />
              <TextCounter control={control} name="detailedDescription" />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark dark:text-secondary-200 mb-2">What Is It?</label>
              <textarea
                id="whatIs"
                {...register('whatIs')}
                rows={3}
                className="w-full px-4 py-2.5 bg-secondary-50 dark:bg-primary-900 border border-secondary-600/20 dark:border-primary-600/30 rounded-xl focus:ring-2 focus:ring-accent outline-none text-text-dark dark:text-secondary-100 transition-all resize-y"
              />
              <TextCounter control={control} name="whatIs" />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark dark:text-secondary-200 mb-2">Typical Visit</label>
              <textarea
                id="typicalVisit"
                {...register('typicalVisit')}
                rows={3}
                className="w-full px-4 py-2.5 bg-secondary-50 dark:bg-primary-900 border border-secondary-600/20 dark:border-primary-600/30 rounded-xl focus:ring-2 focus:ring-accent outline-none text-text-dark dark:text-secondary-100 transition-all resize-y"
              />
              <TextCounter control={control} name="typicalVisit" />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark dark:text-secondary-200 mb-2">Benefits</label>
              <textarea
                id="benefits"
                {...register('benefits')}
                rows={3}
                className="w-full px-4 py-2.5 bg-secondary-50 dark:bg-primary-900 border border-secondary-600/20 dark:border-primary-600/30 rounded-xl focus:ring-2 focus:ring-accent outline-none text-text-dark dark:text-secondary-100 transition-all resize-y"
              />
              <TextCounter control={control} name="benefits" />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark dark:text-secondary-200 mb-2">Benefits Extended</label>
              <textarea
                id="benefitsExtended"
                {...register('benefitsExtended')}
                rows={3}
                className="w-full px-4 py-2.5 bg-secondary-50 dark:bg-primary-900 border border-secondary-600/20 dark:border-primary-600/30 rounded-xl focus:ring-2 focus:ring-accent outline-none text-text-dark dark:text-secondary-100 transition-all resize-y"
              />
              <TextCounter control={control} name="benefitsExtended" />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark dark:text-secondary-200 mb-2">Getting Started</label>
              <textarea
                id="gettingStarted"
                {...register('gettingStarted')}
                rows={3}
                className="w-full px-4 py-2.5 bg-secondary-50 dark:bg-primary-900 border border-secondary-600/20 dark:border-primary-600/30 rounded-xl focus:ring-2 focus:ring-accent outline-none text-text-dark dark:text-secondary-100 transition-all resize-y"
              />
              <TextCounter control={control} name="gettingStarted" />
            </div>

          </div>

          <div className="flex items-center space-x-3 pt-4 border-t border-secondary-600/10 dark:border-white/5">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="w-5 h-5 text-accent border-secondary-300 rounded focus:ring-accent"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-text-dark dark:text-secondary-200">
              Service is Active
            </label>
          </div>

          <div className="pt-6 border-t border-secondary-600/10 dark:border-primary-600/30 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin2/services')}
              className="px-6 py-2.5 text-sm font-semibold text-text-dark dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-primary-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:shadow-lg transition-transform transform hover:-translate-y-0.5 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {isEdit ? 'Save Changes' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
