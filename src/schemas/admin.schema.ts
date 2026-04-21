import { z } from 'zod';

/** Schema for creating a new admin user */
export const createAdminSchema = z.object({
	fullName: z.string().min(2, 'Full name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
	role: z.enum(['admin', 'super_admin'], { message: 'Role must be admin or super_admin' }),
	isActive: z.boolean().default(true),
});

/** Schema for updating an existing admin user */
export const updateAdminSchema = z.object({
	fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
	email: z.string().email('Invalid email address').optional(),
	password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
	role: z.enum(['admin', 'super_admin']).optional(),
	isActive: z.boolean().optional(),
});
