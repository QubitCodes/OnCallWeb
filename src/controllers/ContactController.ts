import { db } from '@db/index';
import { contacts } from '@db/schema';
import { eq, isNull, desc } from 'drizzle-orm';
import { ResponseHandler, INTERNAL_CODES, HTTP_STATUS } from '@utils/responseHandler';
import { contactUpdateSchema, contactCreateSchema } from '@schemas/contact.schema';
import { JwtHelper } from '@utils/jwtHelper';

export class ContactController {
	/**
	 * Extracts and verifies the JWT token from the request.
	 * Returns the decoded payload or an error response.
	 */
	private static async authenticate(requestHelper: any) {
		const token = JwtHelper.extractFromHeader(requestHelper.header('authorization'));
		if (!token) return { error: ResponseHandler.error('Unauthorized', INTERNAL_CODES.AUTHENTICATION_ERROR, HTTP_STATUS.UNAUTHORIZED) };

		const payload = JwtHelper.verify(token);
		if (!payload) return { error: ResponseHandler.error('Invalid or expired token', INTERNAL_CODES.AUTHENTICATION_ERROR, HTTP_STATUS.UNAUTHORIZED) };

		return { payload };
	}

	/**
	 * GET /api/v1/contacts
	 * List all active (non-deleted) contacts
	 */
	static async list(requestHelper: any) {
		const auth = await ContactController.authenticate(requestHelper);
		if (auth.error) return auth.error;

		try {
			const allContacts = await db
				.select()
				.from(contacts)
				.where(isNull(contacts.deletedAt))
				.orderBy(desc(contacts.createdAt));

			return ResponseHandler.success(allContacts, 'Contacts fetched successfully');
		} catch (error) {
			console.error('Error fetching contacts:', error);
			return ResponseHandler.error('Failed to fetch contacts', INTERNAL_CODES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * GET /api/v1/contacts/:id
	 * Show a specific contact by ID
	 */
	static async show(requestHelper: any, id: string) {
		const auth = await ContactController.authenticate(requestHelper);
		if (auth.error) return auth.error;

		try {
			const contact = await db
				.select()
				.from(contacts)
				.where(eq(contacts.id, id))
				.limit(1);

			if (!contact.length || contact[0].deletedAt !== null) {
				return ResponseHandler.error('Contact not found', INTERNAL_CODES.RESOURCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
			}

			return ResponseHandler.success(contact[0], 'Contact fetched successfully');
		} catch (error) {
			console.error('Error fetching contact:', error);
			return ResponseHandler.error('Failed to fetch contact', INTERNAL_CODES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * POST /api/v1/contacts
	 * Create a new contact inquiry (used by public API)
	 */
	static async create(requestHelper: any) {
		// Public endpoint - no auth check required
		const { body } = requestHelper;
		
		const validated = contactCreateSchema.safeParse(body);
		if (!validated.success) {
			return ResponseHandler.error(
				'Validation failed',
				INTERNAL_CODES.VALIDATION_ERROR,
				HTTP_STATUS.BAD_REQUEST,
				validated.error.issues
			);
		}

		try {
			const newContact = await db
				.insert(contacts)
				.values({
					...validated.data,
					status: 'new',
				})
				.returning();

			return ResponseHandler.success(newContact[0], 'Inquiry submitted successfully', INTERNAL_CODES.CREATED, HTTP_STATUS.CREATED);
		} catch (error) {
			console.error('Error creating contact:', error);
			return ResponseHandler.error('Failed to submit inquiry', INTERNAL_CODES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * PUT /api/v1/contacts/:id
	 * Update an existing contact (used by Admin)
	 */
	static async update(requestHelper: any, id: string) {
		const auth = await ContactController.authenticate(requestHelper);
		if (auth.error) return auth.error;

		const { body } = requestHelper;
		const validated = contactUpdateSchema.safeParse(body);

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
				.from(contacts)
				.where(eq(contacts.id, id))
				.limit(1);

			if (!existing.length || existing[0].deletedAt !== null) {
				return ResponseHandler.error('Contact not found', INTERNAL_CODES.RESOURCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
			}

			const validatedData = validated.data;
			const followUpDateObj = validatedData.followUpDate ? new Date(validatedData.followUpDate) : null;
			const followUpTimeObj = validatedData.followUpTime ? new Date(`1970-01-01T${validatedData.followUpTime}`) : null;

			const updatedContact = await db
				.update(contacts)
				.set({
					status: validatedData.status,
					comment: validatedData.comment || null,
					followUpDate: followUpDateObj,
					followUpTime: followUpTimeObj,
					updatedAt: new Date(),
				})
				.where(eq(contacts.id, id))
				.returning();

			return ResponseHandler.success(updatedContact[0], 'Contact updated successfully', INTERNAL_CODES.UPDATED, HTTP_STATUS.OK);
		} catch (error) {
			console.error('Error updating contact:', error);
			return ResponseHandler.error('Failed to update contact', INTERNAL_CODES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * DELETE /api/v1/contacts/:id
	 * Soft-delete a contact
	 */
	static async destroy(requestHelper: any, id: string) {
		const auth = await ContactController.authenticate(requestHelper);
		if (auth.error) return auth.error;

		try {
			const existing = await db
				.select()
				.from(contacts)
				.where(eq(contacts.id, id))
				.limit(1);

			if (!existing.length || existing[0].deletedAt !== null) {
				return ResponseHandler.error('Contact not found', INTERNAL_CODES.RESOURCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
			}

			const reason = requestHelper.body?.deleteReason || 'Deleted by admin';

			await db
				.update(contacts)
				.set({
					deletedAt: new Date(),
					deleteReason: reason,
				})
				.where(eq(contacts.id, id));

			return ResponseHandler.success(null, 'Contact deleted successfully', INTERNAL_CODES.OK, HTTP_STATUS.OK);
		} catch (error) {
			console.error('Error deleting contact:', error);
			return ResponseHandler.error('Failed to delete contact', INTERNAL_CODES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
		}
	}
}
