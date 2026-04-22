import { pgTable, varchar, boolean, timestamp, text, json, integer, doublePrecision, serial } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Base columns for all tables to ensure consistency
const defaultCols = {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdateFn(() => new Date()).notNull(),
  deletedAt: timestamp('deleted_at'),
  deleteReason: varchar('delete_reason', { length: 255 }),
};

export const admins = pgTable('admins', {
  id: defaultCols.id,
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }),
  role: varchar('role', { length: 100 }).notNull().default('admin'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: defaultCols.createdAt,
  updatedAt: defaultCols.updatedAt,
  deletedAt: defaultCols.deletedAt,
  deleteReason: defaultCols.deleteReason,
});

export const settings = pgTable('settings', {
  id: defaultCols.id,
  key: varchar('key', { length: 255 }).notNull().unique(),
  value: json('value'),
  description: text('description'),
  createdAt: defaultCols.createdAt,
  updatedAt: defaultCols.updatedAt,
  deletedAt: defaultCols.deletedAt,
  deleteReason: defaultCols.deleteReason,
});

export const contacts = pgTable('contacts', {
  id: defaultCols.id,
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  serviceType: varchar('service_type', { length: 255 }).notNull(),
  message: text('message').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('view'),
  comment: text('comment'),
  followUpDate: timestamp('follow_up_date'),
  followUpTime: timestamp('follow_up_time'),
  createdAt: defaultCols.createdAt,
  updatedAt: defaultCols.updatedAt,
  deletedAt: defaultCols.deletedAt,
  deleteReason: defaultCols.deleteReason,
});

export const locations = pgTable('locations', {
  id: defaultCols.id,
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  region: varchar('region', { length: 100 }),
  county: varchar('county', { length: 255 }),
  postcode: varchar('postcode', { length: 50 }),
  boundary: json('boundary'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: defaultCols.createdAt,
  updatedAt: defaultCols.updatedAt,
  deletedAt: defaultCols.deletedAt,
  deleteReason: defaultCols.deleteReason,
});

export const locationTemplates = pgTable('location_templates', {
  id: defaultCols.id,
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: defaultCols.createdAt,
  updatedAt: defaultCols.updatedAt,
  deletedAt: defaultCols.deletedAt,
  deleteReason: defaultCols.deleteReason,
});

export const locationTemplateAreas = pgTable('location_template_areas', {
  id: defaultCols.id,
  templateId: varchar('template_id', { length: 36 }).references(() => locationTemplates.id).notNull(),
  locationId: varchar('location_id', { length: 36 }),
  name: varchar('name', { length: 255 }),
  boundary: json('boundary'),
  type: varchar('type', { length: 50 }).notNull().default('include'),
  createdAt: defaultCols.createdAt,
  updatedAt: defaultCols.updatedAt,
  deletedAt: defaultCols.deletedAt,
  deleteReason: defaultCols.deleteReason,
});

export const serviceCategories = pgTable('service_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: defaultCols.createdAt,
  updatedAt: defaultCols.updatedAt,
  deletedAt: defaultCols.deletedAt,
  deleteReason: defaultCols.deleteReason,
});

export const services = pgTable('services', {
  id: defaultCols.id,
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }),
  category: integer('category').references(() => serviceCategories.id),
  description: text('description'),
  fullDescription: text('full_description'),
  detailedDescription: text('detailed_description'),
  whatIs: text('what_is'),
  typicalVisit: text('typical_visit'),
  services: json('services'),
  gettingStartedPoints: json('getting_started_points'),
  stats: json('stats'),
  benefits: text('benefits'),
  benefitsExtended: text('benefits_extended'),
  gettingStarted: text('getting_started'),
  image: varchar('image', { length: 255 }),
  icon: varchar('icon', { length: 255 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: defaultCols.createdAt,
  updatedAt: defaultCols.updatedAt,
  deletedAt: defaultCols.deletedAt,
  deleteReason: defaultCols.deleteReason,
});

export const serviceAvailabilities = pgTable('service_availabilities', {
  id: defaultCols.id,
  serviceId: varchar('service_id', { length: 36 }).references(() => services.id).notNull(),
  templateId: varchar('template_id', { length: 36 }).references(() => locationTemplates.id),
  locationId: varchar('location_id', { length: 36 }),
  postcode: varchar('postcode', { length: 50 }),
  boundary: json('boundary'),
  type: varchar('type', { length: 50 }).notNull().default('include'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: defaultCols.createdAt,
  updatedAt: defaultCols.updatedAt,
  deletedAt: defaultCols.deletedAt,
  deleteReason: defaultCols.deleteReason,
});
