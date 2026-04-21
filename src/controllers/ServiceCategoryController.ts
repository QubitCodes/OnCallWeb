import { db } from '@db/index';
import { serviceCategories } from '@db/schema';
import { eq, isNull, desc } from 'drizzle-orm';
import { ResponseHandler, INTERNAL_CODES, HTTP_STATUS } from '@utils/responseHandler';

export class ServiceCategoryController {
	static async list(requestHelper: any) {
		try {
			const categories = await db
				.select()
				.from(serviceCategories)
				.where(isNull(serviceCategories.deletedAt))
				.orderBy(desc(serviceCategories.createdAt));

			return ResponseHandler.success(categories, 'Categories fetched successfully');
		} catch (error) {
			console.error('Error fetching categories:', error);
			return ResponseHandler.error('Failed to fetch categories', INTERNAL_CODES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
		}
	}
}
