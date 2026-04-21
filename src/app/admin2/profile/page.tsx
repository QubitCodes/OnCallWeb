'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, changePasswordSchema } from '@/schemas/auth.schema';
import { z } from 'zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { User, Mail, Lock, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';

type ProfileFormValues = z.infer<typeof updateProfileSchema>;
type PasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const [isFetching, setIsFetching] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return '';
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = getCookie('token');
      const response = await axios.get('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        const data = response.data.data;
        setUserData(data);
        resetProfile({
          fullName: data.fullName || data.full_name || '',
          email: data.email || '',
        });
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Clear cookies across all possible paths
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'token=; path=/admin2; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'token=; path=/admin2/profile; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        
        toast.error('Session expired. Please log in again.');
        router.push('/admin2/login');
      } else {
        toast.error('Failed to fetch profile data');
      }
    } finally {
      setIsFetching(false);
    }
  };

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsUpdatingProfile(true);
    try {
      const token = getCookie('token');
      const response = await axios.put('/api/v1/auth/profile', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        toast.success(response.data.message || 'Profile updated successfully');
        const updatedData = response.data.data;
        setUserData((prev: any) => ({ ...prev, ...updatedData }));
        resetProfile({
          fullName: updatedData.fullName || updatedData.full_name || '',
          email: updatedData.email || '',
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsUpdatingPassword(true);
    try {
      const token = getCookie('token');
      const response = await axios.put('/api/v1/auth/password', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        toast.success(response.data.message || 'Password changed successfully');
        resetPassword();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-dark dark:text-secondary-100">My Profile</h1>
          <p className="text-text-light dark:text-secondary-400 mt-1">Manage your account settings and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1e1e48] rounded-2xl shadow-card border border-secondary-600/10 dark:border-white/5 overflow-hidden"
        >
          <div className="p-6 border-b border-secondary-600/10 dark:border-white/5 bg-secondary-50/50 dark:bg-[#171738]/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-text-dark dark:text-secondary-100 flex items-center">
              <User className="w-5 h-5 mr-2 text-accent" />
              Profile Information
            </h2>
            {userData?.role && (
              <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full uppercase tracking-wider border border-accent/20">
                {userData.role.replace('_', ' ')}
              </span>
            )}
          </div>
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-text-dark dark:text-secondary-200 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-text-light dark:text-secondary-400" />
                </div>
                <input
                  {...registerProfile('fullName')}
                  type="text"
                  className={`w-full pl-10 pr-4 py-2.5 bg-secondary-100 dark:bg-[#171738] border ${
                    profileErrors.fullName ? 'border-error' : 'border-transparent'
                  } focus:border-accent rounded-xl outline-none text-text-dark dark:text-secondary-100 transition-colors`}
                  placeholder="Enter your full name"
                />
              </div>
              {profileErrors.fullName && (
                <p className="mt-1.5 text-sm text-error font-medium">{profileErrors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-dark dark:text-secondary-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-light dark:text-secondary-400" />
                </div>
                <input
                  {...registerProfile('email')}
                  type="email"
                  className={`w-full pl-10 pr-4 py-2.5 bg-secondary-100 dark:bg-[#171738] border ${
                    profileErrors.email ? 'border-error' : 'border-transparent'
                  } focus:border-accent rounded-xl outline-none text-text-dark dark:text-secondary-100 transition-colors`}
                  placeholder="admin@example.com"
                />
              </div>
              {profileErrors.email && (
                <p className="mt-1.5 text-sm text-error font-medium">{profileErrors.email.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="flex items-center px-6 py-2.5 bg-accent hover:bg-[#34a4cf] text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70"
              >
                {isUpdatingProfile ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>

        {/* Change Password Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#1e1e48] rounded-2xl shadow-card border border-secondary-600/10 dark:border-white/5 overflow-hidden"
        >
          <div className="p-6 border-b border-secondary-600/10 dark:border-white/5 bg-secondary-50/50 dark:bg-[#171738]/50">
            <h2 className="text-lg font-bold text-text-dark dark:text-secondary-100 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-accent" />
              Change Password
            </h2>
          </div>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-text-dark dark:text-secondary-200 mb-2">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-light dark:text-secondary-400" />
                </div>
                <input
                  {...registerPassword('currentPassword')}
                  type="password"
                  className={`w-full pl-10 pr-4 py-2.5 bg-secondary-100 dark:bg-[#171738] border ${
                    passwordErrors.currentPassword ? 'border-error' : 'border-transparent'
                  } focus:border-accent rounded-xl outline-none text-text-dark dark:text-secondary-100 transition-colors`}
                  placeholder="••••••••"
                />
              </div>
              {passwordErrors.currentPassword && (
                <p className="mt-1.5 text-sm text-error font-medium">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-dark dark:text-secondary-200 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-light dark:text-secondary-400" />
                </div>
                <input
                  {...registerPassword('newPassword')}
                  type="password"
                  className={`w-full pl-10 pr-4 py-2.5 bg-secondary-100 dark:bg-[#171738] border ${
                    passwordErrors.newPassword ? 'border-error' : 'border-transparent'
                  } focus:border-accent rounded-xl outline-none text-text-dark dark:text-secondary-100 transition-colors`}
                  placeholder="••••••••"
                />
              </div>
              {passwordErrors.newPassword && (
                <p className="mt-1.5 text-sm text-error font-medium">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="flex items-center px-6 py-2.5 bg-primary hover:bg-primary-900 dark:bg-[#2c2c6c] dark:hover:bg-[#3d3d8a] text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70"
              >
                {isUpdatingPassword ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Lock className="w-5 h-5 mr-2" />
                )}
                Update Password
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
