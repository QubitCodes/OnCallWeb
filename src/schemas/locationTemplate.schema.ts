import { z } from 'zod';

export const locationTemplateAreaSchema = z.object({
  name: z.string().optional().nullable(),
  locationId: z.string().optional().nullable(),
  boundary: z.any().optional().nullable(), // GeoJSON
  type: z.enum(['include', 'exclude']).default('include'),
});

export const locationTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true).optional(),
  areas: z.array(locationTemplateAreaSchema).optional(),
});
