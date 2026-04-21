import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config();
// Load MySQL credentials explicitly from the old Adonis DB
const mysqlConfig = {
  host: '139.84.137.64',
  port: 3306,
  user: 'onCall',
  password: 'YxSEa4FPA3YwDRwk',
  database: 'onCall',
};

const runDataMigration = async () => {
  console.log('Starting data migration from MySQL to PostgreSQL...');

  const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
  const pgDb = drizzlePg(pgPool, { schema });

  const mysqlConn = await mysql.createConnection(mysqlConfig);

  try {
    // Maps for Old INT ID -> New UUID
    const locationMap = new Map<number, string>();
    const serviceMap = new Map<number, string>();

    // 1. Migrate Locations
    console.log('Migrating locations...');
    const [locationsData]: any = await mysqlConn.query('SELECT * FROM locations');
    for (const loc of locationsData) {
      const newId = crypto.randomUUID();
      locationMap.set(loc.id, newId);
      await pgDb.insert(schema.locations).values({
        id: newId,
        name: loc.name,
        type: loc.type,
        region: loc.region,
        county: loc.county,
        postcode: loc.postcode,
        isActive: Boolean(loc.is_active),
        createdAt: new Date(loc.created_at || Date.now()),
        updatedAt: new Date(loc.updated_at || Date.now()),
      });
    }
    console.log(`Migrated ${locationsData.length} locations.`);

    // 2. Migrate Services
    console.log('Migrating services...');
    const [servicesData]: any = await mysqlConn.query('SELECT * FROM services');
    for (const svc of servicesData) {
      const newId = crypto.randomUUID();
      serviceMap.set(svc.id, newId);
      
      const safeParseJson = (data: any) => {
        if (!data) return null;
        if (typeof data === 'string') {
          try { return JSON.parse(data); } catch { return null; }
        }
        return data;
      };

      await pgDb.insert(schema.services).values({
        id: newId,
        name: svc.name,
        slug: svc.slug,
        category: svc.category,
        description: svc.description,
        fullDescription: svc.full_description,
        detailedDescription: svc.detailed_description,
        whatIs: svc.what_is,
        typicalVisit: svc.typical_visit,
        services: safeParseJson(svc.services),
        gettingStartedPoints: safeParseJson(svc.getting_started_points),
        stats: safeParseJson(svc.stats),
        benefits: svc.benefits,
        benefitsExtended: svc.benefits_extended,
        gettingStarted: svc.getting_started,
        image: svc.image,
        icon: svc.icon,
        isActive: Boolean(svc.is_active),
        createdAt: new Date(svc.created_at || Date.now()),
        updatedAt: new Date(svc.updated_at || Date.now()),
      });
    }
    console.log(`Migrated ${servicesData.length} services.`);

    // 3. Migrate Service Availabilities (using maps)
    console.log('Migrating service availabilities...');
    const [availData]: any = await mysqlConn.query('SELECT * FROM service_availabilities');
    for (const avail of availData) {
      const mappedServiceId = serviceMap.get(avail.service_id);
      const mappedLocationId = locationMap.get(avail.location_id);
      
      if (mappedServiceId && mappedLocationId) {
        await pgDb.insert(schema.serviceAvailabilities).values({
          serviceId: mappedServiceId,
          locationId: mappedLocationId,
          postcode: avail.postcode,
          isActive: Boolean(avail.is_active),
          createdAt: new Date(avail.created_at || Date.now()),
          updatedAt: new Date(avail.updated_at || Date.now()),
        });
      } else {
        console.warn(`Skipping availability mapping issue - Service: ${avail.service_id}, Location: ${avail.location_id}`);
      }
    }
    console.log(`Migrated ${availData.length} service availabilities.`);

    // 4. Migrate Admins
    console.log('Migrating admins...');
    const [adminsData]: any = await mysqlConn.query('SELECT * FROM admins');
    for (const admin of adminsData) {
      await pgDb.insert(schema.admins).values({
        email: admin.email,
        password: admin.password,
        fullName: admin.full_name,
        role: admin.role,
        isActive: Boolean(admin.is_active),
        createdAt: new Date(admin.created_at || Date.now()),
        updatedAt: new Date(admin.updated_at || Date.now()),
      });
    }
    console.log(`Migrated ${adminsData.length} admins.`);

    // 5. Migrate Contacts
    console.log('Migrating contacts...');
    const [contactsData]: any = await mysqlConn.query('SELECT * FROM contacts');
    for (const contact of contactsData) {
      await pgDb.insert(schema.contacts).values({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        serviceType: contact.service_type,
        message: contact.message,
        status: contact.status,
        comment: contact.comment,
        followUpDate: contact.follow_up_date ? new Date(contact.follow_up_date) : null,
        followUpTime: contact.follow_up_time ? new Date(contact.follow_up_time) : null,
        createdAt: new Date(contact.created_at || Date.now()),
        updatedAt: new Date(contact.updated_at || Date.now()),
        deletedAt: contact.deleted_at ? new Date(contact.deleted_at) : null,
      });
    }
    console.log(`Migrated ${contactsData.length} contacts.`);

    // 6. Migrate Settings
    console.log('Migrating settings...');
    const [settingsData]: any = await mysqlConn.query('SELECT * FROM settings');
    for (const setting of settingsData) {
      const safeParseJson = (data: any) => {
        if (!data) return null;
        if (typeof data === 'string') {
          try { return JSON.parse(data); } catch { return null; }
        }
        return data;
      };

      await pgDb.insert(schema.settings).values({
        key: setting.key,
        value: safeParseJson(setting.value),
        description: setting.description,
        createdAt: new Date(setting.created_at || Date.now()),
        updatedAt: new Date(setting.updated_at || Date.now()),
      });
    }
    console.log(`Migrated ${settingsData.length} settings.`);

    console.log('Data migration complete!');
  } catch (error) {
    console.error('Data migration failed:', error);
  } finally {
    await mysqlConn.end();
    await pgPool.end();
  }
};

runDataMigration();
