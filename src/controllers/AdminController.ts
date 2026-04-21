import { db } from '@db/index';
import { admins } from '@db/schema';
import { eq, isNull, and, ne } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { JwtHelper } from '@utils/jwtHelper';
import { ResponseHandler, INTERNAL_CODES, HTTP_STATUS } from '@utils/responseHandler';
import { createAdminSchema, updateAdminSchema } from '@schemas/admin.schema';

/**
 * AdminController
 * Handles CRUD operations for admin users.
 * Super admins are only visible to other super admins.
 */
export class AdminController {

	/**
	 * Extracts and verifies the JWT token from the request.
	 * Returns the decoded payload or an error response.
	 */
	private static async authenticate(requestHelper: any) {
		const token = JwtHelper.extractFromHeader(requestHelper.header('authorization'));
		if (!token) return { error: ResponseHandler.error('Unauthorized', INTERNAL_CODES.AUTHENTICATION_ERROR, HTTP_STATUS.UNAUTHORIZED) };

		const payload = JwtHelper.verify(token) as { id: string; role: string } | null;
		if (!payload) return { error: ResponseHandler.error('Invalid or expired token', INTERNAL_CODES.AUTHENTICATION_ERROR, HTTP_STATUS.UNAUTHORIZED) };

		return { payload };
	}

	/**
	 * GET /api/v1/admins
	 * Lists all admin users (soft-deleted excluded).
	 * Super admins are only visible if the requester is also a super_admin.
	 */
	static async list(requestHelper: any) {
		const auth = await AdminController.authenticate(requestHelper);
		if (auth.error) return auth.error;
		const { payload } = auth;

		let adminList = await db
			.select({
				id: admins.id,
				fullName: admins.fullName,
				email: admins.email,
				role: admins.role,
				isActive: admins.isActive,
				createdAt: admins.createdAt,
				updatedAt: admins.updatedAt,
			})
			.from(admins)
			.where(isNull(admins.deletedAt));

		// If the requester is NOT a super_admin, hide super_admin users
		if (payload!.role !== 'super_admin') {
			adminList = adminList.filter((a) => a.role !== 'super_admin');
		}

		return ResponseHandler.success(adminList, 'Admins fetched successfully');
	}

	/**
	 * GET /api/v1/admins/:id
	 * Returns a single admin by ID.
	 */
	static async show(requestHelper: any, id: string) {
		const auth = await AdminController.authenticate(requestHelper);
		if (auth.error) return auth.error;
		const { payload } = auth;

		const adminList = await db
			.select({
				id: admins.id,
				fullName: admins.fullName,
				email: admins.email,
				role: admins.role,
				isActive: admins.isActive,
				createdAt: admins.createdAt,
				updatedAt: admins.updatedAt,
			})
			.from(admins)
			.where(and(eq(admins.id, id), isNull(admins.deletedAt)))
			.limit(1);

		const admin = adminList[0];
		if (!admin) {
			return ResponseHandler.error('Admin not found', INTERNAL_CODES.RESOURCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
		}

		// Non-super admins cannot view super_admin users
		if (admin.role === 'super_admin' && payload!.role !== 'super_admin') {
			return ResponseHandler.error('Admin not found', INTERNAL_CODES.RESOURCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
		}

		return ResponseHandler.success(admin, 'Admin fetched successfully');
	}

	/**
	 * POST /api/v1/admins
	 * Creates a new admin user.
	 */
	static async create(requestHelper: any) {
		const auth = await AdminController.authenticate(requestHelper);
		if (auth.error) return auth.error;
		const { payload } = auth;

		const { body } = requestHelper;
		const validated = createAdminSchema.safeParse(body);

		if (!validated.success) {
			return ResponseHandler.error(
				'Validation failed',
				INTERNAL_CODES.VALIDATION_ERROR,
				HTTP_STATUS.BAD_REQUEST,
				validated.error.issues
			);
		}

		const { fullName, email, password, role, isActive } = validated.data;

		// Non-super admins cannot create super_admin users
		if (role === 'super_admin' && payload!.role !== 'super_admin') {
			return ResponseHandler.error('You do not have permission to create a super admin', INTERNAL_CODES.PERMISSION_DENIED, HTTP_STATUS.FORBIDDEN);
		}

		// Check for duplicate email
		const existing = await db
			.select()
			.from(admins)
			.where(and(eq(admins.email, email), isNull(admins.deletedAt)))
			.limit(1);

		if (existing.length > 0) {
			return ResponseHandler.error('Email already in use', INTERNAL_CODES.RESOURCE_ALREADY_EXISTS, HTTP_STATUS.BAD_REQUEST);
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const result = await db.insert(admins).values({
			fullName,
			email,
			password: hashedPassword,
			role,
			isActive,
		}).returning();

		if (!result.length) {
			return ResponseHandler.error('Failed to create admin', INTERNAL_CODES.GENERAL_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
		}

		const { password: _, ...adminData } = result[0];
		return ResponseHandler.success(adminData, 'Admin created successfully', INTERNAL_CODES.CREATED, HTTP_STATUS.CREATED);
	}

	/**
	 * PUT /api/v1/admins/:id
	 * Updates an existing admin user.
	 * Password field is optional — if provided and non-empty, it will be hashed and updated.
	 */
	static async update(requestHelper: any, id: string) {
		const auth = await AdminController.authenticate(requestHelper);
		if (auth.error) return auth.error;
		const { payload } = auth;

		const { body } = requestHelper;
		const validated = updateAdminSchema.safeParse(body);

		if (!validated.success) {
			return ResponseHandler.error(
				'Validation failed',
				INTERNAL_CODES.VALIDATION_ERROR,
				HTTP_STATUS.BAD_REQUEST,
				validated.error.issues
			);
		}

		// Check if the target admin exists
		const targetList = await db
			.select()
			.from(admins)
			.where(and(eq(admins.id, id), isNull(admins.deletedAt)))
			.limit(1);

		const target = targetList[0];
		if (!target) {
			return ResponseHandler.error('Admin not found', INTERNAL_CODES.RESOURCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
		}

		// Non-super admins cannot edit super_admin users
		if (target.role === 'super_admin' && payload!.role !== 'super_admin') {
			return ResponseHandler.error('Admin not found', INTERNAL_CODES.RESOURCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
		}

		const { fullName, email, password, role, isActive } = validated.data;

		// Non-super admins cannot promote to super_admin
		if (role === 'super_admin' && payload!.role !== 'super_admin') {
			return ResponseHandler.error('You do not have permission to assign super admin role', INTERNAL_CODES.PERMISSION_DENIED, HTTP_STATUS.FORBIDDEN);
		}

		// Check for duplicate email (excluding self)
		if (email) {
			const existingEmail = await db
				.select()
				.from(admins)
				.where(and(eq(admins.email, email), isNull(admins.deletedAt), ne(admins.id, id)))
				.limit(1);

			if (existingEmail.length > 0) {
				return ResponseHandler.error('Email already in use', INTERNAL_CODES.RESOURCE_ALREADY_EXISTS, HTTP_STATUS.BAD_REQUEST);
			}
		}

		// Build update payload
		const updateData: Record<string, any> = {};
		if (fullName !== undefined) updateData.fullName = fullName;
		if (email !== undefined) updateData.email = email;
		if (role !== undefined) updateData.role = role;
		if (isActive !== undefined) updateData.isActive = isActive;

		// Only hash and update password if a non-empty string was provided
		if (password && password.length > 0) {
			updateData.password = await bcrypt.hash(password, 10);
		}

		const updated = await db
			.update(admins)
			.set(updateData)
			.where(eq(admins.id, id))
			.returning();

		if (!updated.length) {
			return ResponseHandler.error('Failed to update admin', INTERNAL_CODES.GENERAL_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
		}

		const { password: _, ...adminData } = updated[0];
		return ResponseHandler.success(adminData, 'Admin updated successfully', INTERNAL_CODES.UPDATED, HTTP_STATUS.OK);
	}

	/**
	 * DELETE /api/v1/admins/:id
	 * Soft-deletes an admin user. Prevents self-deletion.
	 */
	static async destroy(requestHelper: any, id: string) {
		const auth = await AdminController.authenticate(requestHelper);
		if (auth.error) return auth.error;
		const { payload } = auth;

		// Prevent self-deletion
		if (payload!.id === id) {
			return ResponseHandler.error('You cannot delete your own account', INTERNAL_CODES.GENERAL_BUSINESS_LOGIC_ERROR, HTTP_STATUS.BAD_REQUEST);
		}

		// Check if the target admin exists
		const targetList = await db
			.select()
			.from(admins)
			.where(and(eq(admins.id, id), isNull(admins.deletedAt)))
			.limit(1);

		const target = targetList[0];
		if (!target) {
			return ResponseHandler.error('Admin not found', INTERNAL_CODES.RESOURCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
		}

		// Non-super admins cannot delete super_admin users
		if (target.role === 'super_admin' && payload!.role !== 'super_admin') {
			return ResponseHandler.error('Admin not found', INTERNAL_CODES.RESOURCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
		}

		const reason = requestHelper.body?.deleteReason || 'Deleted by admin';

		await db
			.update(admins)
			.set({
				deletedAt: new Date(),
				deleteReason: reason,
			})
			.where(eq(admins.id, id));

		return ResponseHandler.success(null, 'Admin deleted successfully', INTERNAL_CODES.OK, HTTP_STATUS.OK);
	}
}
