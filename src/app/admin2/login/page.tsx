'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/schemas/auth.schema';
import { z } from 'zod';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

type LoginFormValues = z.infer<typeof loginSchema>;

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const callbackUrl = searchParams.get('callbackUrl') || '/admin2/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/v1/auth/login', data);
      if (response.data.status) {
        // Set cookie or local storage
        document.cookie = `token=${response.data.misc.token}; path=/; max-age=2592000`; // 30 days
        toast.success(response.data.message || 'Login successful');
        router.replace(callbackUrl);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex bg-white z-50">
      {/* Left Banner (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-primary items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{ backgroundImage: 'url(/images/hero-image.jpg)' }}
        ></div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/40 to-primary/95"></div>
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 p-12 text-center"
        >
          <img src="/images/logo.png" alt="OnCall Logo" className="h-24 w-auto mx-auto mb-8" style={{ filter: 'brightness(0) invert(1)' }} />
          <h2 className="text-4xl font-accent italic text-white mb-4">We care for you</h2>
          <p className="text-white/80 text-lg max-w-md mx-auto">
            Delivering compassionate, memorable care in the comfort of your own home — because your home is your life.
          </p>
        </motion.div>
      </div>

      {/* Right Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-gray-50 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 m-4"
        >
          <div className="text-center mb-10 flex flex-col items-center lg:hidden">
            <img src="/images/logo.png" alt="OnCall Logo" className="h-16 w-auto mb-4" />
          </div>
          <div className="text-center mb-10 hidden lg:block">
            <h1 className="text-2xl font-bold text-primary">Welcome Back</h1>
            <p className="text-gray-500 text-sm mt-2">Sign in to manage your portal</p>
          </div>
          <div className="text-center mb-10 lg:hidden">
            <p className="text-gray-500 text-sm mt-2">Sign in to manage your portal</p>
          </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('email')}
                type="email"
                className={`block w-full pl-11 pr-4 py-3 bg-gray-50 border ${
                  errors.email ? 'border-red-500' : 'border-gray-200'
                } rounded-xl text-primary focus:ring-2 focus:ring-accent focus:border-transparent transition-all outline-none`}
                placeholder="admin@oncall.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-sm text-error font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('password')}
                type="password"
                className={`block w-full pl-11 pr-4 py-3 bg-gray-50 border ${
                  errors.password ? 'border-red-500' : 'border-gray-200'
                } rounded-xl text-primary focus:ring-2 focus:ring-accent focus:border-transparent transition-all outline-none`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="mt-1.5 text-sm text-error font-medium">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-accent hover:bg-[#34a4cf] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-70 transition-all transform hover:-translate-y-0.5"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </motion.div>

      {/* Footer / Copyright */}
      <div className="mt-8 text-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} Oncall Care Service. All rights reserved.</p>
        <p className="mt-1">
          Designed & Developed by <a href="https://qubit.codes" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-medium">Qubit Codes</a>
        </p>
      </div>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}
