'use client';

import { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, X, Loader2 } from 'lucide-react';
import AdminForm from '@/components/admin2/admins/AdminForm';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useHeaderActions } from '@/context/HeaderActionContext';

function AdminsContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const action = searchParams.get('action');
	const editId = searchParams.get('id');

	const [adminsList, setAdminsList] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterRole, setFilterRole] = useState<string>('all');
	const [filterStatus, setFilterStatus] = useState<string>('all');
	const [currentUserId, setCurrentUserId] = useState<string>('');

	const getCookie = (name: string) => {
		if (typeof document === 'undefined') return '';
		const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
		if (match) return match[2];
		return '';
	};

	/** Fetch the admins list from the API */
	const fetchAdmins = useCallback(async () => {
		setIsLoading(true);
		try {
			const token = getCookie('token');
			const res = await axios.get('/api/v1/admins', {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (res.data.status) {
				setAdminsList(res.data.data || []);
			}
		} catch {
			toast.error('Failed to load admins');
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchAdmins();
		// Fetch current logged-in user ID
		const fetchMe = async () => {
			try {
				const token = getCookie('token');
				const res = await axios.get('/api/v1/auth/me', {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (res.data.status && res.data.data) {
					setCurrentUserId(res.data.data.id);
				}
			} catch {}
		};
		fetchMe();
	}, [fetchAdmins]);

	/** Inject the "Add Admin" button into the topbar */
	const addButton = useMemo(() => (
		<button
			onClick={() => router.push('/admin2/admins?action=create')}
			className="flex items-center px-4 py-2 bg-accent hover:bg-[#34a4cf] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
		>
			<Plus className="w-4 h-4 mr-1.5" />
			Add Admin
		</button>
	), [router]);
	useHeaderActions(addButton);

	const closeDrawer = () => {
		router.push('/admin2/admins');
	};

	/** Soft-delete an admin */
	const handleDelete = async (id: string, name: string) => {
		if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

		try {
			const token = getCookie('token');
			const res = await axios.delete(`/api/v1/admins/${id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (res.data.status) {
				toast.success(res.data.message || 'Admin deleted');
				fetchAdmins();
			}
		} catch (error: any) {
			toast.error(error.response?.data?.message || 'Failed to delete admin');
		}
	};

	/** Format role for display */
	const formatRole = (role: string) =>
		role ? role.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : '';

	/** Filter admins by search term, role, and status */
	const filteredAdmins = adminsList.filter((a) => {
		const term = searchTerm.toLowerCase();
		const name = (a.fullName || a.full_name || '').toLowerCase();
		const email = (a.email || '').toLowerCase();
		const matchesSearch = name.includes(term) || email.includes(term);
		const matchesRole = filterRole === 'all' || a.role === filterRole;
		const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? a.isActive : !a.isActive);
		return matchesSearch && matchesRole && matchesStatus;
	});

	return (
		<div className="relative min-h-[calc(100vh-80px)]">
			{/* Search & Filters */}
			<div className="bg-white dark:bg-[#1e1e48] p-4 rounded-xl shadow-card border border-secondary-600/10 dark:border-white/5 mb-6 flex flex-wrap items-center gap-3">
				<div className="relative flex-1 min-w-[200px] max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
					<input
						type="text"
						placeholder="Search by name or email..."
						className="w-full pl-10 pr-4 py-2 bg-secondary-100 dark:bg-[#171738] border border-transparent focus:border-accent rounded-lg outline-none text-text-dark dark:text-secondary-100 text-sm"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				<select
					value={filterRole}
					onChange={(e) => setFilterRole(e.target.value)}
					className="px-3 py-2 bg-secondary-100 dark:bg-[#171738] border border-transparent focus:border-accent rounded-lg outline-none text-text-dark dark:text-secondary-100 text-sm appearance-none cursor-pointer"
				>
					<option value="all">All Roles</option>
					<option value="admin">Admin</option>
					<option value="super_admin">Super Admin</option>
				</select>
				<select
					value={filterStatus}
					onChange={(e) => setFilterStatus(e.target.value)}
					className="px-3 py-2 bg-secondary-100 dark:bg-[#171738] border border-transparent focus:border-accent rounded-lg outline-none text-text-dark dark:text-secondary-100 text-sm appearance-none cursor-pointer"
				>
					<option value="all">All Status</option>
					<option value="active">Active</option>
					<option value="inactive">Inactive</option>
				</select>
			</div>

			{/* Data Table */}
			<div className="bg-white dark:bg-[#1e1e48] rounded-xl shadow-card border border-secondary-600/10 dark:border-white/5 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-secondary-100 dark:bg-[#171738] text-text-dark dark:text-secondary-200 text-sm font-semibold">
								<th className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5">Name</th>
								<th className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5">Email</th>
								<th className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5">Role</th>
								<th className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5">Status</th>
								<th className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5 text-right">Actions</th>
							</tr>
						</thead>
						<tbody>
							{isLoading ? (
								<tr>
									<td colSpan={5} className="text-center py-12">
										<Loader2 className="w-6 h-6 animate-spin text-accent mx-auto" />
									</td>
								</tr>
							) : filteredAdmins.length === 0 ? (
								<tr>
									<td colSpan={5} className="text-center py-12 text-text-light dark:text-secondary-400">
										{searchTerm ? 'No admins match your search.' : 'No admins found. Create one to get started.'}
									</td>
								</tr>
							) : (
								filteredAdmins.map((admin, idx) => (
									<motion.tr
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: idx * 0.05 }}
										key={admin.id}
										className="hover:bg-secondary-50 dark:hover:bg-[#171738]/50 transition-colors group"
									>
										<td className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5 font-medium text-text-dark dark:text-secondary-100">
											{admin.fullName || admin.full_name || '—'}
											{admin.id === currentUserId && (
												<span className="ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-accent/15 text-accent border border-accent/25 uppercase tracking-wider">You</span>
											)}
										</td>
										<td className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5 text-text-light dark:text-secondary-300">
											{admin.email}
										</td>
										<td className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5">
											<span className={`px-3 py-1 text-xs font-semibold rounded-full ${
												admin.role === 'super_admin'
													? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
													: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
											}`}>
												{formatRole(admin.role)}
											</span>
										</td>
										<td className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5">
											<span className={`px-3 py-1 text-xs font-semibold rounded-full ${
												admin.isActive
													? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
													: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
											}`}>
												{admin.isActive ? 'Active' : 'Inactive'}
											</span>
										</td>
										<td className="px-6 py-4 border-b border-secondary-600/10 dark:border-white/5 text-right">
											<button
												onClick={() => router.push(`/admin2/admins?action=edit&id=${admin.id}`)}
												className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors mr-2"
												title="Edit"
											>
												<Edit2 className="w-4 h-4" />
											</button>
											{admin.id !== currentUserId && (
												<button
													onClick={() => handleDelete(admin.id, admin.fullName || admin.full_name || admin.email)}
													className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
													title="Delete"
												>
													<Trash2 className="w-4 h-4" />
												</button>
											)}
										</td>
									</motion.tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Slide-out Drawer for Create/Edit */}
			<AnimatePresence>
				{(action === 'create' || action === 'edit') && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={closeDrawer}
							className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
						/>
						<motion.div
							initial={{ x: '100%' }}
							animate={{ x: 0 }}
							exit={{ x: '100%' }}
							transition={{ type: 'spring', damping: 25, stiffness: 200 }}
							className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white dark:bg-[#1e1e48] shadow-2xl z-50 overflow-y-auto border-l border-secondary-600/20 dark:border-white/10"
						>
							<div className="sticky top-0 bg-white/80 dark:bg-primary-800/80 backdrop-blur-md px-6 py-4 border-b border-secondary-600/10 dark:border-primary-600/30 flex justify-between items-center z-10">
								<h2 className="text-xl font-bold text-text-dark dark:text-secondary-100">
									{action === 'create' ? 'Create New Admin' : 'Edit Admin'}
								</h2>
								<button onClick={closeDrawer} className="p-2 hover:bg-secondary-100 dark:hover:bg-primary-700 rounded-full text-text-light transition-colors">
									<X className="w-5 h-5" />
								</button>
							</div>
							<div className="p-6">
								<AdminForm
									onClose={closeDrawer}
									isEdit={action === 'edit'}
									editId={editId}
									onSaved={fetchAdmins}
								/>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}

export default function AdminsPage() {
	return (
		<Suspense fallback={<div className="p-8 text-center text-text-light">Loading admins module...</div>}>
			<AdminsContent />
		</Suspense>
	);
}
