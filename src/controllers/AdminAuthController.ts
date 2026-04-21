import { db } from '@db/index';
import { admins } from '@db/schema';
import { eq, isNull, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { JwtHelper } from '@utils/jwtHelper';
import { ResponseHandler, INTERNAL_CODES, HTTP_STATUS } from '@utils/responseHandler';
import { loginSchema, registerSchema, updateProfileSchema, changePasswordSchema } from '@schemas/auth.schema';

export class AdminAuthController {
  static async login(requestHelper: any) {
    const { body } = requestHelper;

    const validated = loginSchema.safeParse(body);
    if (!validated.success) {
      return ResponseHandler.error(
        'Validation failed',
        INTERNAL_CODES.VALIDATION_ERROR,
        HTTP_STATUS.BAD_REQUEST,
        validated.error.issues
      );
    }

    const { email, password } = validated.data;

    const adminList = await db
      .select()
      .from(admins)
      .where(and(eq(admins.email, email), isNull(admins.deletedAt)))
      .limit(1);

    const admin = adminList[0];

    if (!admin || !admin.isActive) {
      return ResponseHandler.error('Invalid credentials or inactive account', INTERNAL_CODES.AUTHENTICATION_ERROR, HTTP_STATUS.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return ResponseHandler.error('Invalid credentials', INTERNAL_CODES.AUTHENTICATION_ERROR, HTTP_STATUS.UNAUTHORIZED);
    }

    const token = JwtHelper.sign({ id: admin.id, role: admin.role });

    const { password: _, ...adminData } = admin;

    return ResponseHandler.success(adminData, 'Login successful', INTERNAL_CODES.OK, HTTP_STATUS.OK, { token });
  }

  static async register(requestHelper: any) {
    const { body } = requestHelper;

    const validated = registerSchema.safeParse(body);
    if (!validated.success) {
      return ResponseHandler.error(
        'Validation failed',
        INTERNAL_CODES.VALIDATION_ERROR,
        HTTP_STATUS.BAD_REQUEST,
        validated.error.issues
      );
    }

    const { fullName, email, password } = validated.data;

    const existingAdmin = await db
      .select()
      .from(admins)
      .where(and(eq(admins.email, email), isNull(admins.deletedAt)))
      .limit(1);

    if (existingAdmin.length > 0) {
      return ResponseHandler.error('Email already in use', INTERNAL_CODES.RESOURCE_ALREADY_EXISTS, HTTP_STATUS.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.insert(admins).values({
      fullName,
      email,
      password: hashedPassword,
    });

    return ResponseHandler.success(null, 'Registration successful', INTERNAL_CODES.CREATED, HTTP_STATUS.CREATED);
  }

  static async me(requestHelper: any) {
    const token = JwtHelper.extractFromHeader(requestHelper.header('authorization'));
    if (!token) return ResponseHandler.error('Unauthorized', INTERNAL_CODES.AUTHENTICATION_ERROR, HTTP_STATUS.UNAUTHORIZED);

    const payload = JwtHelper.verify(token) as { id: string } | null;
    if (!payload) return ResponseHandler.error('Invalid or expired token', INTERNAL_CODES.AUTHENTICATION_ERROR, HTTP_STATUS.UNAUTHORIZED);

    const adminList = await db
      .select()
      .from(admins)
      .where(and(eq(admins.id, payload.id), isNull(admins.deletedAt)))
      .limit(1);

    const admin = adminList[0];
    if (!admin || !admin.isActive) {
      return ResponseHandler.error('User not found or inactive', INTERNAL_CODES.AUTHENTICATION_ERROR, HTTP_STATUS.UNAUTHORIZED);
    }

    const { password: _, ...adminData } = admin;
    return ResponseHandler.success(adminData, 'Token verified');
  }

  static async updateProfile(requestHelper: any) {
    const token = JwtHelper.extractFromHeader(requestHelper.header('authorization'));
    if (!token) return ResponseHandler.error('Unauthorized', INTERNAL_CODES.AUTHENTICATION_ERROR, HTTP_STATUS.UNAUTHORIZED);

    const payload = JwtHelper.verify(token) as { id: string } | null;
    if (!payload) return ResponseHandler.error('Invalid or expired token', INTERNAL_CODES.AUTHENTICATION_ERROR, HTTP_STATUS.UNAUTHORIZED);

    const { body } = requestHelper;
    const validated = updateProfileSchema.safeParse(body);
    
    if (!validated.success) {
      return ResponseHandler.error(
        'Validation failed',
        INTERNAL_CODES.VALIDATION_ERROR,
        HTTP_STATUS.BAD_REQUEST,
        validated.error.issues
      );
    }

    const { fullName, email } = validated.data;

    // Check if another admin already uses this email
    if (email) {
      const existingEmail = await db
        .select()
        .from(admins)
        .where(and(eq(admins.email, email), isNull(admins.deletedAt)))
        .limit(1);
        
      if (existingEmail.length > 0 && existingEmail[0].id !== payload.id) {
        return ResponseHandler.error('Email already in use', INTERNAL_CODES.RESOURCE_ALREADY_EXISTS, HTTP_STATUS.BAD_REQUEST);
      }
    }

    const updatedAdmin = await db
      .update(admins)
      .set({
        ...(fullName && { fullName }),
        ...(email && { email }),
      })
      .where(eq(admins.id, payload.id))
      .returning();

    if (!updatedAdmin.length) {
      return ResponseHandler.error('Failed to update profile', INTERNAL_CODES.GENERAL_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    const { password: _, ...adminData } = updatedAdmin[0];
    return ResponseHandler.success(adminData, 'Profile updated successfully', INTERNAL_CODES.UPDATED, HTTP_STATUS.OK);
  }

  static async changePassword(requestHelper: any) {
    const token = JwtHelper.extractFromHeader(requestHelper.header('authorization'));
    if (!token) return ResponseHandler.error('Unauthorized', INTERNAL_CODES.AUTHENTICATION_ERROR, HTTP_STATUS.UNAUTHORIZED);

    const payload = JwtHelper.verify(token) as { id: string } | null;
    if (!payload) return ResponseHandler.error('Invalid or expired token', INTERNAL_CODES.AUTHENTICATION_ERROR, HTTP_STATUS.UNAUTHORIZED);

    const { body } = requestHelper;
    const validated = changePasswordSchema.safeParse(body);
    
    if (!validated.success) {
      return ResponseHandler.error(
        'Validation failed',
        INTERNAL_CODES.VALIDATION_ERROR,
        HTTP_STATUS.BAD_REQUEST,
        validated.error.issues
      );
    }

    const { currentPassword, newPassword } = validated.data;

    const adminList = await db
      .select()
      .from(admins)
      .where(and(eq(admins.id, payload.id), isNull(admins.deletedAt)))
      .limit(1);

    const admin = adminList[0];
    if (!admin) {
      return ResponseHandler.error('User not found', INTERNAL_CODES.RESOURCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return ResponseHandler.error('Incorrect current password', INTERNAL_CODES.AUTHENTICATION_ERROR, HTTP_STATUS.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db
      .update(admins)
      .set({ password: hashedPassword })
      .where(eq(admins.id, payload.id));

    return ResponseHandler.success(null, 'Password updated successfully', INTERNAL_CODES.UPDATED, HTTP_STATUS.OK);
  }
}
