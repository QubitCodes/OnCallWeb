'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAdminSchema, updateAdminSchema } from '@/schemas/admin.schema';
import { z } from 'zod';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Loader2, Save, User, Mail, Lock, Shield } from 'lucide-react';

type CreateFormValues = z.infer<typeof createAdminSchema>;
type UpdateFormValues = z.infer<typeof updateAdminSchema>;

interface AdminFormProps {
	/** Called when the form should close (after save or cancel) */
	onClose: () => void;
	/** Whether we are editing an existing admin */
	isEdit: boolean;
	/** The ID of the admin to edit (only when isEdit=true) */
	editId?: string | null;
	/** Called after a successful create/update to refresh the list */
	onSaved?: () => void;
}

export default function AdminForm({ onClose, isEdit, editId, onSaved }: AdminFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(isEdit);

	const getCookie = (name: string) => {
		if (typeof document === 'undefined') return '';
		const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
		if (match) return match[2];
		return '';
	};

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CreateFormValues | UpdateFormValues>({
		resolver: zodResolver(isEdit ? updateAdminSchema : createAdminSchema),
		defaultValues: {
			fullName: '',
			email: '',
			password: '',
			role: 'admin',
			isActive: true,
		},
	});

	/** Fetch admin data when editing */
	useEffect(() => {
		if (isEdit && editId) {
			const fetchAdmin = async () => {
				try {
					const token = getCookie('token');
					const res = await axios.get(`/api/v1/admins/${editId}`, {
						headers: { Authorization: `Bearer ${token}` },
					});
					if (res.data.status && res.data.data) {
						const d = res.data.data;
						reset({
							fullName: d.fullName || d.full_name || '',
							email: d.email || '',
							password: '',
							role: d.role || 'admin',
							isActive: d.isActive ?? true,
						});
					}
				} catch {
					toast.error('Failed to load admin data');
				} finally {
					setIsFetching(false);
				}
			};
			fetchAdmin();
		}
	}, [isEdit, editId]);

	const onSubmit = async (data: any) => {
		setIsLoading(true);
		try {
			const token = getCookie('token');
			const headers = { Authorization: `Bearer ${token}` };

			// If editing and password is empty, remove it from payload
			const payload = { ...data };
			if (isEdit && (!payload.password || payload.password === '')) {
				delete payload.password;
			}

			if (isEdit && editId) {
				const res = await axios.put(`/api/v1/admins/${editId}`, payload, { headers });
				if (res.data.status) {
					toast.success(res.data.message || 'Admin updated successfully');
					onSaved?.();
					onClose();
				}
			} else {
				const res = await axios.post('/api/v1/admins', payload, { headers });
				if (res.data.status) {
					toast.success(res.data.message || 'Admin created successfully');
					onSaved?.();
					onClose();
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
			<div className="flex items-center justify-center h-64">
				<Loader2 className="w-8 h-8 animate-spin text-accent" />
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			{/* Full Name */}
			<div>
				<label className="block text-sm font-semibold text-text-dark dark:text-secondary-200 mb-2">
					Full Name
				</label>
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<User className="h-5 w-5 text-text-light dark:text-secondary-400" />
					</div>
					<input
						{...register('fullName')}
						type="text"
						className={`w-full pl-10 pr-4 py-2.5 bg-secondary-100 dark:bg-[#171738] border ${
							errors.fullName ? 'border-error' : 'border-transparent'
						} focus:border-accent rounded-xl outline-none text-text-dark dark:text-secondary-100 transition-colors`}
						placeholder="Enter full name"
					/>
				</div>
				{errors.fullName && (
					<p className="mt-1.5 text-sm text-error font-medium">{errors.fullName.message as string}</p>
				)}
			</div>

			{/* Email */}
			<div>
				<label className="block text-sm font-semibold text-text-dark dark:text-secondary-200 mb-2">
					Email Address
				</label>
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Mail className="h-5 w-5 text-text-light dark:text-secondary-400" />
					</div>
					<input
						{...register('email')}
						type="email"
						className={`w-full pl-10 pr-4 py-2.5 bg-secondary-100 dark:bg-[#171738] border ${
							errors.email ? 'border-error' : 'border-transparent'
						} focus:border-accent rounded-xl outline-none text-text-dark dark:text-secondary-100 transition-colors`}
						placeholder="admin@example.com"
					/>
				</div>
				{errors.email && (
					<p className="mt-1.5 text-sm text-error font-medium">{errors.email.message as string}</p>
				)}
			</div>

			{/* Password */}
			<div>
				<label className="block text-sm font-semibold text-text-dark dark:text-secondary-200 mb-2">
					Password {isEdit && <span className="text-xs text-text-light font-normal">(leave blank to keep current)</span>}
				</label>
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Lock className="h-5 w-5 text-text-light dark:text-secondary-400" />
					</div>
					<input
						{...register('password')}
						type="password"
						className={`w-full pl-10 pr-4 py-2.5 bg-secondary-100 dark:bg-[#171738] border ${
							errors.password ? 'border-error' : 'border-transparent'
						} focus:border-accent rounded-xl outline-none text-text-dark dark:text-secondary-100 transition-colors`}
						placeholder={isEdit ? '••••••••' : 'Min. 6 characters'}
					/>
				</div>
				{errors.password && (
					<p className="mt-1.5 text-sm text-error font-medium">{errors.password.message as string}</p>
				)}
			</div>

			{/* Role */}
			<div>
				<label className="block text-sm font-semibold text-text-dark dark:text-secondary-200 mb-2">
					Role
				</label>
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Shield className="h-5 w-5 text-text-light dark:text-secondary-400" />
					</div>
					<select
						{...register('role')}
						className={`w-full pl-10 pr-4 py-2.5 bg-secondary-100 dark:bg-[#171738] border ${
							errors.role ? 'border-error' : 'border-transparent'
						} focus:border-accent rounded-xl outline-none text-text-dark dark:text-secondary-100 transition-colors appearance-none`}
					>
						<option value="admin">Admin</option>
						<option value="super_admin">Super Admin</option>
					</select>
				</div>
				{errors.role && (
					<p className="mt-1.5 text-sm text-error font-medium">{errors.role.message as string}</p>
				)}
			</div>

			{/* Is Active Toggle */}
			<div className="flex items-center justify-between p-4 bg-secondary-100 dark:bg-[#171738] rounded-xl">
				<div>
					<p className="text-sm font-semibold text-text-dark dark:text-secondary-200">Active Status</p>
					<p className="text-xs text-text-light dark:text-secondary-400 mt-0.5">Inactive admins cannot log in</p>
				</div>
				<label className="relative inline-flex items-center cursor-pointer">
					<input
						type="checkbox"
						{...register('isActive')}
						className="sr-only peer"
					/>
					<div className="w-11 h-6 bg-secondary-300 peer-focus:outline-none rounded-full peer dark:bg-secondary-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
				</label>
			</div>

			{/* Submit Button */}
			<div className="flex justify-end pt-4 border-t border-secondary-600/10 dark:border-white/5">
				<button
					type="button"
					onClick={onClose}
					className="px-5 py-2.5 mr-3 text-text-light dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-[#171738] rounded-xl transition-colors font-medium"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={isLoading}
					className="flex items-center px-6 py-2.5 bg-accent hover:bg-[#34a4cf] text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70"
				>
					{isLoading ? (
						<Loader2 className="w-5 h-5 mr-2 animate-spin" />
					) : (
						<Save className="w-5 h-5 mr-2" />
					)}
					{isEdit ? 'Update Admin' : 'Create Admin'}
				</button>
			</div>
		</form>
	);
}
