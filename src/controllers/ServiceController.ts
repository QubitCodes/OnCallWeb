import { db } from '@db/index';
import { services, serviceCategories, serviceAvailabilities } from '@db/schema';
import { eq, isNull, desc } from 'drizzle-orm';
import { ResponseHandler, INTERNAL_CODES, HTTP_STATUS } from '@utils/responseHandler';
import { serviceSchema } from '@schemas/service.schema';
import { JwtHelper } from '@utils/jwtHelper';

export class ServiceController {
	private static async authenticate(requestHelper: any) {
		const token = JwtHelper.extractFromHeader(requestHelper.header('authorization'));
		if (!token) return { error: ResponseHandler.error('Unauthorized', INTERNAL_CODES.AUTHENTICATION_ERROR, HTTP_STATUS.UNAUTHORIZED) };

		const payload = JwtHelper.verify(token);
		if (!payload) return { error: ResponseHandler.error('Invalid or expired token', INTERNAL_CODES.AUTHENTICATION_ERROR, HTTP_STATUS.UNAUTHORIZED) };

		return { payload };
	}

	static async list(requestHelper: any) {
		const auth = await ServiceController.authenticate(requestHelper);
		if (auth.error) return auth.error;

		try {
			const allServices = await db
				.select({
					id: services.id,
					name: services.name,
					slug: services.slug,
					category: services.category,
					categoryName: serviceCategories.name,
					description: services.description,
					fullDescription: services.fullDescription,
					detailedDescription: services.detailedDescription,
					whatIs: services.whatIs,
					typicalVisit: services.typicalVisit,
					services: services.services,
					gettingStartedPoints: services.gettingStartedPoints,
					stats: services.stats,
					benefits: services.benefits,
					benefitsExtended: services.benefitsExtended,
					gettingStarted: services.gettingStarted,
					image: services.image,
					icon: services.icon,
					isActive: services.isActive,
					createdAt: services.createdAt,
					updatedAt: services.updatedAt,
				})
				.from(services)
				.leftJoin(serviceCategories, eq(services.category, serviceCategories.id))
				.where(isNull(services.deletedAt))
				.orderBy(desc(services.createdAt));

			return ResponseHandler.success(allServices, 'Services fetched successfully');
		} catch (error) {
			console.error('Error fetching services:', error);
			return ResponseHandler.error('Failed to fetch services', INTERNAL_CODES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
		}
	}

	static async show(requestHelper: any, id: string) {
		const auth = await ServiceController.authenticate(requestHelper);
		if (auth.error) return auth.error;

		try {
			const record = await db
				.select({
					id: services.id,
					name: services.name,
					slug: services.slug,
					category: services.category,
					categoryName: serviceCategories.name,
					description: services.description,
					fullDescription: services.fullDescription,
					detailedDescription: services.detailedDescription,
					whatIs: services.whatIs,
					typicalVisit: services.typicalVisit,
					services: services.services,
					gettingStartedPoints: services.gettingStartedPoints,
					stats: services.stats,
					benefits: services.benefits,
					benefitsExtended: services.benefitsExtended,
					gettingStarted: services.gettingStarted,
					image: services.image,
					icon: services.icon,
					isActive: services.isActive,
					createdAt: services.createdAt,
					updatedAt: services.updatedAt,
					deletedAt: services.deletedAt,
				})
				.from(services)
				.leftJoin(serviceCategories, eq(services.category, serviceCategories.id))
				.where(eq(services.id, id))
				.limit(1);

			if (!record.length || record[0].deletedAt !== null) {
				return ResponseHandler.error('Service not found', INTERNAL_CODES.RESOURCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
			}

			// Fetch related location configuration
			const availabilities = await db
				.select()
				.from(serviceAvailabilities)
				.where(eq(serviceAvailabilities.serviceId, id));

			let locationTemplateId = null;
			let customAreas: any[] = [];
			
			for (const av of availabilities) {
				if (av.templateId) {
					locationTemplateId = av.templateId;
				}
				if (av.boundary) {
					customAreas.push({ boundary: av.boundary, type: av.type });
				}
			}

			// Omit deletedAt from the response payload
			const { deletedAt, ...serviceData } = record[0];

			return ResponseHandler.success({ ...serviceData, locationTemplateId, customAreas }, 'Service fetched successfully');
		} catch (error) {
			console.error('Error fetching service:', error);
			return ResponseHandler.error('Failed to fetch service', INTERNAL_CODES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
		}
	}

	static async create(requestHelper: any) {
		const auth = await ServiceController.authenticate(requestHelper);
		if (auth.error) return auth.error;

		const { body } = requestHelper;
		const validated = serviceSchema.safeParse(body);

		if (!validated.success) {
			return ResponseHandler.error(
				'Validation failed',
				INTERNAL_CODES.VALIDATION_ERROR,
				HTTP_STATUS.BAD_REQUEST,
				validated.error.issues
			);
		}

		try {
			const { locationTemplateId, customAreas, ...serviceInsertData } = validated.data;
			
			const newRecord = await db
				.insert(services)
				.values({
					...serviceInsertData,
				})
				.returning();

			const serviceId = newRecord[0].id;

			// Handle serviceAvailabilities
			if (locationTemplateId) {
				await db.insert(serviceAvailabilities).values({
					serviceId,
					templateId: locationTemplateId,
					type: 'include',
				});
			}

			if (customAreas && customAreas.length > 0) {
				await db.insert(serviceAvailabilities).values(
					customAreas.map((area: any) => ({
						serviceId,
						boundary: area.boundary,
						type: area.type,
					}))
				);
			}

			return ResponseHandler.success(newRecord[0], 'Service created successfully', INTERNAL_CODES.CREATED, HTTP_STATUS.CREATED);
		} catch (error) {
			console.error('Error creating service:', error);
			return ResponseHandler.error('Failed to create service', INTERNAL_CODES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
		}
	}

	static async update(requestHelper: any, id: string) {
		const auth = await ServiceController.authenticate(requestHelper);
		if (auth.error) return auth.error;

		const { body } = requestHelper;
		const validated = serviceSchema.safeParse(body);

		if (!validated.success) {
			return ResponseHandler.error(
				'Validation failed',
				INTERNAL_CODES.VALIDATION_ERROR,
				HTTP_STATUS.BAD_REQUEST,
				validated.error.issues
			);
		}

		try {
			const existing = await db
				.select()
				.from(services)
				.where(eq(services.id, id))
				.limit(1);

			if (!existing.length || existing[0].deletedAt !== null) {
				return ResponseHandler.error('Service not found', INTERNAL_CODES.RESOURCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
			}

			const { locationTemplateId, customAreas, ...serviceUpdateData } = validated.data;

			const updatedRecord = await db
				.update(services)
				.set({
					...serviceUpdateData,
					updatedAt: new Date(),
				})
				.where(eq(services.id, id))
				.returning();

			// Update serviceAvailabilities completely
			await db.delete(serviceAvailabilities).where(eq(serviceAvailabilities.serviceId, id));

			if (locationTemplateId) {
				await db.insert(serviceAvailabilities).values({
					serviceId: id,
					templateId: locationTemplateId,
					type: 'include',
				});
			}

			if (customAreas && customAreas.length > 0) {
				await db.insert(serviceAvailabilities).values(
					customAreas.map((area: any) => ({
						serviceId: id,
						boundary: area.boundary,
						type: area.type,
					}))
				);
			}

			return ResponseHandler.success(updatedRecord[0], 'Service updated successfully', INTERNAL_CODES.UPDATED, HTTP_STATUS.OK);
		} catch (error) {
			console.error('Error updating service:', error);
			return ResponseHandler.error('Failed to update service', INTERNAL_CODES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
		}
	}

	static async updateLocations(requestHelper: any, id: string) {
		const auth = await ServiceController.authenticate(requestHelper);
		if (auth.error) return auth.error;

		const { body } = requestHelper;
		
		try {
			const existing = await db
				.select()
				.from(services)
				.where(eq(services.id, id))
				.limit(1);

			if (!existing.length || existing[0].deletedAt !== null) {
				return ResponseHandler.error('Service not found', INTERNAL_CODES.RESOURCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
			}

			const locationTemplateId = body.locationTemplateId || null;
			const customAreas = body.customAreas || [];

			// Update serviceAvailabilities completely
			await db.delete(serviceAvailabilities).where(eq(serviceAvailabilities.serviceId, id));

			if (locationTemplateId) {
				await db.insert(serviceAvailabilities).values({
					serviceId: id,
					templateId: locationTemplateId,
					type: 'include',
				});
			}

			if (customAreas && customAreas.length > 0) {
				await db.insert(serviceAvailabilities).values(
					customAreas.map((area: any) => ({
						serviceId: id,
						boundary: area.boundary,
						type: area.type,
					}))
				);
			}

			return ResponseHandler.success(null, 'Service locations updated successfully', INTERNAL_CODES.UPDATED, HTTP_STATUS.OK);
		} catch (error) {
			console.error('Error updating service locations:', error);
			return ResponseHandler.error('Failed to update service locations', INTERNAL_CODES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
		}
	}

	static async destroy(requestHelper: any, id: string) {
		const auth = await ServiceController.authenticate(requestHelper);
		if (auth.error) return auth.error;

		try {
			const existing = await db
				.select()
				.from(services)
				.where(eq(services.id, id))
				.limit(1);

			if (!existing.length || existing[0].deletedAt !== null) {
				return ResponseHandler.error('Service not found', INTERNAL_CODES.RESOURCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
			}

			const reason = requestHelper.body?.deleteReason || 'Deleted by admin';

			await db
				.update(services)
				.set({
					deletedAt: new Date(),
					deleteReason: reason,
				})
				.where(eq(services.id, id));

			return ResponseHandler.success(null, 'Service deleted successfully', INTERNAL_CODES.OK, HTTP_STATUS.OK);
		} catch (error) {
			console.error('Error deleting service:', error);
			return ResponseHandler.error('Failed to delete service', INTERNAL_CODES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
		}
	}
}
