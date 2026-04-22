import { db } from '@db/index';
import { services, serviceAvailabilities, locationTemplateAreas, locations } from '@db/schema';
import { eq, isNull, and } from 'drizzle-orm';
import { ResponseHandler, INTERNAL_CODES, HTTP_STATUS } from '@utils/responseHandler';
import { point, booleanPointInPolygon } from '@turf/turf';

export class AvailabilityController {
  static async checkAvailability(requestHelper: any) {
    const { body } = requestHelper;
    const { lat, lng } = body;

    if (lat === undefined || lng === undefined) {
      return ResponseHandler.error('Coordinates lat and lng are required', INTERNAL_CODES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST);
    }

    try {
      const userPoint = point([lng, lat]);

      // 1. Fetch all active services
      const allServices = await db
        .select()
        .from(services)
        .where(and(eq(services.isActive, true), isNull(services.deletedAt)));

      const availableServiceIds: string[] = [];

      // 2. Iterate through each service to check availability
      for (const service of allServices) {
        // Fetch all availabilities for this service
        const availabilities = await db
          .select()
          .from(serviceAvailabilities)
          .where(and(eq(serviceAvailabilities.serviceId, service.id), isNull(serviceAvailabilities.deletedAt)));

        let isExcluded = false;
        let isIncluded = false;

        // Process custom boundaries attached directly to the service
        for (const avail of availabilities) {
          if (avail.boundary) {
            try {
              const inPolygon = booleanPointInPolygon(userPoint, avail.boundary as any);
              if (inPolygon) {
                if (avail.type === 'exclude') isExcluded = true;
                if (avail.type === 'include') isIncluded = true;
              }
            } catch (e) {
              console.error('Invalid geojson boundary in service availability', e);
            }
          }

          // If it references a specific location, fetch its boundary
          if (avail.locationId) {
             const loc = await db.select().from(locations).where(eq(locations.id, avail.locationId)).limit(1);
             if (loc.length && loc[0].boundary) {
               try {
                 const inPolygon = booleanPointInPolygon(userPoint, loc[0].boundary as any);
                 if (inPolygon) {
                   if (avail.type === 'exclude') isExcluded = true;
                   if (avail.type === 'include') isIncluded = true;
                 }
               } catch(e) {}
             }
          }

          // If it uses a template, fetch the template areas
          if (avail.templateId) {
            const tplAreas = await db
              .select()
              .from(locationTemplateAreas)
              .where(eq(locationTemplateAreas.templateId, avail.templateId));
            
            for (const tplArea of tplAreas) {
               if (tplArea.boundary) {
                 try {
                   const inPolygon = booleanPointInPolygon(userPoint, tplArea.boundary as any);
                   if (inPolygon) {
                     if (tplArea.type === 'exclude') isExcluded = true;
                     if (tplArea.type === 'include') isIncluded = true;
                   }
                 } catch(e) {}
               }
               if (tplArea.locationId) {
                 const loc = await db.select().from(locations).where(eq(locations.id, tplArea.locationId)).limit(1);
                 if (loc.length && loc[0].boundary) {
                   try {
                     const inPolygon = booleanPointInPolygon(userPoint, loc[0].boundary as any);
                     if (inPolygon) {
                       if (tplArea.type === 'exclude') isExcluded = true;
                       if (tplArea.type === 'include') isIncluded = true;
                     }
                   } catch(e) {}
                 }
               }
            }
          }
        }

        // Exclusions override inclusions
        if (isExcluded) {
           continue; // Skip, not available
        }
        
        if (isIncluded) {
           availableServiceIds.push(service.id);
        }
      }

      const availableServices = allServices.filter(s => availableServiceIds.includes(s.id));

      return ResponseHandler.success(availableServices, 'Availability checked successfully');
    } catch (error) {
      console.error('Error checking availability:', error);
      return ResponseHandler.error('Failed to check availability', INTERNAL_CODES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}
