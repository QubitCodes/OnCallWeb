import { db } from '@db/index';
import { locationTemplates, locationTemplateAreas } from '@db/schema';
import { eq, isNull, desc } from 'drizzle-orm';
import { ResponseHandler, INTERNAL_CODES, HTTP_STATUS } from '@utils/responseHandler';
import { locationTemplateSchema } from '@schemas/locationTemplate.schema';
import { JwtHelper } from '@utils/jwtHelper';

export class LocationTemplateController {
	private static async authenticate(requestHelper: any) {
		const token = JwtHelper.extractFromHeader(requestHelper.header('authorization'));
		if (!token) return { error: ResponseHandler.error('Unauthorized', INTERNAL_CODES.AUTHENTICATION_ERROR, HTTP_STATUS.UNAUTHORIZED) };

		const payload = JwtHelper.verify(token);
		if (!payload) return { error: ResponseHandler.error('Invalid or expired token', INTERNAL_CODES.AUTHENTICATION_ERROR, HTTP_STATUS.UNAUTHORIZED) };

		return { payload };
	}

	static async list(requestHelper: any) {
		const auth = await LocationTemplateController.authenticate(requestHelper);
		if (auth.error) return auth.error;

		try {
			const templates = await db
				.select()
				.from(locationTemplates)
				.where(isNull(locationTemplates.deletedAt))
				.orderBy(desc(locationTemplates.createdAt));

			// Fetch areas for each template
			const templatesWithAreas = await Promise.all(
				templates.map(async (t) => {
					const areas = await db
						.select()
						.from(locationTemplateAreas)
						.where(eq(locationTemplateAreas.templateId, t.id));
					return { ...t, areas };
				})
			);

			return ResponseHandler.success(templatesWithAreas, 'Location templates fetched successfully');
		} catch (error) {
			console.error('Error fetching location templates:', error);
			return ResponseHandler.error('Failed to fetch location templates', INTERNAL_CODES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
		}
	}

	static async show(requestHelper: any, id: string) {
		const auth = await LocationTemplateController.authenticate(requestHelper);
		if (auth.error) return auth.error;

		try {
			const record = await db
				.select()
				.from(locationTemplates)
				.where(eq(locationTemplates.id, id))
				.limit(1);

			if (!record.length || record[0].deletedAt !== null) {
				return ResponseHandler.error('Template not found', INTERNAL_CODES.RESOURCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
			}

			const areas = await db
				.select()
				.from(locationTemplateAreas)
				.where(eq(locationTemplateAreas.templateId, id));

			const { deletedAt, ...templateData } = record[0];

			return ResponseHandler.success({ ...templateData, areas }, 'Template fetched successfully');
		} catch (error) {
			console.error('Error fetching template:', error);
			return ResponseHandler.error('Failed to fetch template', INTERNAL_CODES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
		}
	}

	static async create(requestHelper: any) {
		const auth = await LocationTemplateController.authenticate(requestHelper);
		if (auth.error) return auth.error;

		const { body } = requestHelper;
		const validated = locationTemplateSchema.safeParse(body);

		if (!validated.success) {
			return ResponseHandler.error(
				'Validation failed',
				INTERNAL_CODES.VALIDATION_ERROR,
				HTTP_STATUS.BAD_REQUEST,
				validated.error.issues
			);
		}

		try {
			const { areas, ...templateData } = validated.data;
			
			const newRecord = await db
				.insert(locationTemplates)
				.values(templateData)
				.returning();

			const templateId = newRecord[0].id;

			let createdAreas: any[] = [];
			if (areas && areas.length > 0) {
				createdAreas = await db
					.insert(locationTemplateAreas)
					.values(
						areas.map((a) => ({
							...a,
							templateId,
						}))
					)
					.returning();
			}

			return ResponseHandler.success({ ...newRecord[0], areas: createdAreas }, 'Template created successfully', INTERNAL_CODES.CREATED, HTTP_STATUS.CREATED);
		} catch (error) {
			console.error('Error creating template:', error);
			return ResponseHandler.error('Failed to create template', INTERNAL_CODES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
		}
	}

	static async update(requestHelper: any, id: string) {
		const auth = await LocationTemplateController.authenticate(requestHelper);
		if (auth.error) return auth.error;

		const { body } = requestHelper;
		const validated = locationTemplateSchema.safeParse(body);

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
				.from(locationTemplates)
				.where(eq(locationTemplates.id, id))
				.limit(1);

			if (!existing.length || existing[0].deletedAt !== null) {
				return ResponseHandler.error('Template not found', INTERNAL_CODES.RESOURCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
			}

			const { areas, ...templateData } = validated.data;

			const updatedRecord = await db
				.update(locationTemplates)
				.set({
					...templateData,
					updatedAt: new Date(),
				})
				.where(eq(locationTemplates.id, id))
				.returning();

			// Replace areas completely
			if (areas !== undefined) {
				await db.delete(locationTemplateAreas).where(eq(locationTemplateAreas.templateId, id));
				
				if (areas.length > 0) {
					await db
						.insert(locationTemplateAreas)
						.values(
							areas.map((a) => ({
								...a,
								templateId: id,
							}))
						);
				}
			}

			return ResponseHandler.success(updatedRecord[0], 'Template updated successfully', INTERNAL_CODES.UPDATED, HTTP_STATUS.OK);
		} catch (error) {
			console.error('Error updating template:', error);
			return ResponseHandler.error('Failed to update template', INTERNAL_CODES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
		}
	}

	static async destroy(requestHelper: any, id: string) {
		const auth = await LocationTemplateController.authenticate(requestHelper);
		if (auth.error) return auth.error;

		try {
			const existing = await db
				.select()
				.from(locationTemplates)
				.where(eq(locationTemplates.id, id))
				.limit(1);

			if (!existing.length || existing[0].deletedAt !== null) {
				return ResponseHandler.error('Template not found', INTERNAL_CODES.RESOURCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
			}

			const reason = requestHelper.body?.deleteReason || 'Deleted by admin';

			await db
				.update(locationTemplates)
				.set({
					deletedAt: new Date(),
					deleteReason: reason,
				})
				.where(eq(locationTemplates.id, id));

			return ResponseHandler.success(null, 'Template deleted successfully', INTERNAL_CODES.OK, HTTP_STATUS.OK);
		} catch (error) {
			console.error('Error deleting template:', error);
			return ResponseHandler.error('Failed to delete template', INTERNAL_CODES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
		}
	}
}
