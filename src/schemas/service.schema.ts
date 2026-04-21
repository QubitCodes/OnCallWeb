import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().nullable().optional(),
  fullDescription: z.string().nullable().optional(),
  detailedDescription: z.string().nullable().optional(),
  whatIs: z.string().nullable().optional(),
  typicalVisit: z.string().nullable().optional(),
  benefits: z.string().nullable().optional(),
  benefitsExtended: z.string().nullable().optional(),
  gettingStarted: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export type ServiceSchema = z.infer<typeof serviceSchema>;
