'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactUpdateSchema } from '@/schemas/contact.schema';
import { z } from 'zod';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Loader2, Save, Calendar, Clock, MessageSquare, AlertCircle } from 'lucide-react';

type UpdateFormValues = z.infer<typeof contactUpdateSchema>;

interface ContactFormProps {
	onClose: () => void;
	editId?: string | null;
	onSaved?: () => void;
}

export default function ContactForm({ onClose, editId, onSaved }: ContactFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(true);
	const [contactData, setContactData] = useState<any>(null);

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
	} = useForm<UpdateFormValues>({
		resolver: zodResolver(contactUpdateSchema),
		defaultValues: {
			status: 'new',
			comment: '',
			followUpDate: '',
			followUpTime: '',
		},
	});

	/** Fetch contact details */
	useEffect(() => {
		if (editId) {
			const fetchContact = async () => {
				try {
					const token = getCookie('token');
					const res = await axios.get(`/api/v1/contacts/${editId}`, {
						headers: { Authorization: `Bearer ${token}` },
					});
					if (res.data.status && res.data.data) {
						const d = res.data.data;
						setContactData(d);

						// Format dates for inputs
						let formattedDate = '';
						if (d.followUpDate) {
							formattedDate = new Date(d.followUpDate).toISOString().split('T')[0];
						}
						
						let formattedTime = '';
						if (d.followUpTime) {
							// d.followUpTime might be a full ISO date timestamp depending on DB setup, 
							// we just need the HH:MM
							const t = new Date(d.followUpTime);
							if (!isNaN(t.getTime())) {
								formattedTime = t.toISOString().substring(11, 16);
							}
						}

						reset({
							status: d.status || 'new',
							comment: d.comment || '',
							followUpDate: formattedDate,
							followUpTime: formattedTime,
						});
					}
				} catch {
					toast.error('Failed to load contact data');
					onClose();
				} finally {
					setIsFetching(false);
				}
			};
			fetchContact();
		}
	}, [editId]);

	const onSubmit = async (data: any) => {
		setIsLoading(true);
		try {
			const token = getCookie('token');
			const res = await axios.put(`/api/v1/contacts/${editId}`, data, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (res.data.status) {
				toast.success(res.data.message || 'Contact updated successfully');
				onSaved?.();
				onClose();
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
		<div className="space-y-8">
			{/* READ ONLY SECTION - Customer Details */}
			<div className="bg-secondary-50 dark:bg-primary-900/40 p-5 rounded-xl border border-secondary-600/10 dark:border-white/5 shadow-inner">
				<h3 className="text-sm font-bold text-primary dark:text-secondary-200 uppercase tracking-wider mb-4 border-b border-secondary-600/10 dark:border-white/10 pb-2">
					Inquiry Details
				</h3>
				
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
					<div>
						<p className="text-xs text-text-light dark:text-secondary-400">Customer Name</p>
						<p className="font-semibold text-text-dark dark:text-white">{contactData?.name}</p>
					</div>
					<div>
						<p className="text-xs text-text-light dark:text-secondary-400">Service Type Requested</p>
						<p className="font-semibold text-text-dark dark:text-white">{contactData?.serviceType}</p>
					</div>
					<div>
						<p className="text-xs text-text-light dark:text-secondary-400">Email Address</p>
						<p className="font-medium text-text-dark dark:text-white break-all">{contactData?.email}</p>
					</div>
					<div>
						<p className="text-xs text-text-light dark:text-secondary-400">Phone Number</p>
						<p className="font-medium text-text-dark dark:text-white">{contactData?.phone || 'Not provided'}</p>
					</div>
				</div>
				
				<div>
					<p className="text-xs text-text-light dark:text-secondary-400 mb-1">Message / Requirements</p>
					<div className="bg-white dark:bg-[#171738] p-3 rounded-lg text-sm text-text-dark dark:text-secondary-100 whitespace-pre-wrap border border-secondary-600/5 dark:border-white/5 leading-relaxed">
						{contactData?.message}
					</div>
				</div>
			</div>

			{/* EDITABLE SECTION - Admin Management */}
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				<h3 className="text-sm font-bold text-primary dark:text-secondary-200 uppercase tracking-wider border-b border-secondary-600/10 dark:border-white/10 pb-2">
					Management actions
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Status Dropdown */}
					<div className="md:col-span-2">
						<label className="block text-sm font-semibold text-text-dark dark:text-secondary-200 mb-2">
							Inquiry Status
						</label>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<AlertCircle className="h-5 w-5 text-text-light dark:text-secondary-400" />
							</div>
							<select
								{...register('status')}
								className={`w-full pl-10 pr-4 py-2.5 bg-secondary-100 dark:bg-[#171738] border ${
									errors.status ? 'border-error' : 'border-transparent'
								} focus:border-accent rounded-xl outline-none text-text-dark dark:text-secondary-100 transition-colors appearance-none`}
							>
								<option value="new">New (Unread)</option>
								<option value="in_progress">In Progress (Following Up)</option>
								<option value="resolved">Resolved (Completed)</option>
								<option value="spam">Spam (Junk)</option>
							</select>
						</div>
						{errors.status && (
							<p className="mt-1.5 text-sm text-error font-medium">{errors.status.message as string}</p>
						)}
					</div>

					{/* Follow Up Date */}
					<div>
						<label className="block text-sm font-semibold text-text-dark dark:text-secondary-200 mb-2">
							Follow-Up Date
						</label>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Calendar className="h-5 w-5 text-text-light dark:text-secondary-400" />
							</div>
							<input
								{...register('followUpDate')}
								type="date"
								className={`w-full pl-10 pr-4 py-2.5 bg-secondary-100 dark:bg-[#171738] border ${
									errors.followUpDate ? 'border-error' : 'border-transparent'
								} focus:border-accent rounded-xl outline-none text-text-dark dark:text-secondary-100 transition-colors`}
							/>
						</div>
					</div>

					{/* Follow Up Time */}
					<div>
						<label className="block text-sm font-semibold text-text-dark dark:text-secondary-200 mb-2">
							Follow-Up Time
						</label>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Clock className="h-5 w-5 text-text-light dark:text-secondary-400" />
							</div>
							<input
								{...register('followUpTime')}
								type="time"
								className={`w-full pl-10 pr-4 py-2.5 bg-secondary-100 dark:bg-[#171738] border ${
									errors.followUpTime ? 'border-error' : 'border-transparent'
								} focus:border-accent rounded-xl outline-none text-text-dark dark:text-secondary-100 transition-colors`}
							/>
						</div>
					</div>
				</div>

				{/* Internal Comments */}
				<div>
					<label className="block text-sm font-semibold text-text-dark dark:text-secondary-200 mb-2">
						Internal Admin Comment
					</label>
					<div className="relative">
						<div className="absolute top-3 left-3 pointer-events-none">
							<MessageSquare className="h-5 w-5 text-text-light dark:text-secondary-400" />
						</div>
						<textarea
							{...register('comment')}
							rows={4}
							className={`w-full pl-10 pr-4 py-2.5 bg-secondary-100 dark:bg-[#171738] border ${
								errors.comment ? 'border-error' : 'border-transparent'
							} focus:border-accent rounded-xl outline-none text-text-dark dark:text-secondary-100 transition-colors resize-none`}
							placeholder="Add notes about this inquiry..."
						></textarea>
					</div>
				</div>

				{/* Submit Button */}
				<div className="flex justify-end pt-6 border-t border-secondary-600/10 dark:border-white/5">
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
						Update Contact
					</button>
				</div>
			</form>
		</div>
	);
}
