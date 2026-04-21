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
