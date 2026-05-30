import { z } from 'zod';

export const contactUpdateSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved', 'spam']),
  comment: z.string().nullable().optional(),
  followUpDate: z.string().nullable().optional(),
  followUpTime: z.string().nullable().optional(),
});

export type ContactUpdateSchema = z.infer<typeof contactUpdateSchema>;

// Note: If you ever add a public API for creating contacts, define contactCreateSchema here:
export const contactCreateSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().nullable().optional(),
  serviceType: z.string().min(2, 'Service type is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type ContactCreateSchema = z.infer<typeof contactCreateSchema>;

export const contactFormSchema = z.object({
	fname: z.string().trim()
		.min(2, 'First name is required and must be at least 2 characters')
		.regex(/^[a-zA-Z\s-]+$/, 'First name must contain only letters, spaces, or hyphens'),
	lname: z.string().trim().optional().or(z.literal(''))
		.refine(val => {
			if (!val) return true;
			return /^[a-zA-Z]+$/.test(val);
		}, {
			message: 'Last name must contain only letters (no spaces, numbers, or special characters)',
		}),
	phone: z.string().trim().optional().or(z.literal(''))
		.refine(val => {
			if (!val) return true;
			const clean = val.replace(/[\s\(\)-]/g, '');
			if (clean === '+' || clean === '+44' || clean === '+91' || clean === '+353' || clean === '+33' || clean === '+49' || clean === '+34' || clean === '+39') {
				return true;
			}
			return /^\+[0-9]{10,15}$/.test(clean);
		}, {
			message: 'Invalid phone format. Please enter a valid number including country code.',
		}),
	email: z.string().trim().optional().or(z.literal('')).refine(val => {
		if (!val) return true;
		return z.string().email().safeParse(val).success;
	}, {
		message: 'Invalid email address syntax',
	}),
	message: z.string().trim().min(10, 'Message must be at least 10 characters'),
}).superRefine((data, ctx) => {
	const isPhoneEmpty = !data.phone || 
		['+', '+44', '+91', '+353', '+33', '+49', '+34', '+39'].includes(data.phone.replace(/[\s\(\)-]/g, ''));
	
	if (!data.email && isPhoneEmpty) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'Either Email or Phone Number is required',
			path: ['email'],
		});
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'Either Email or Phone Number is required',
			path: ['phone'],
		});
	}
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

