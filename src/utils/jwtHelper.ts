import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'fallback-secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

export class JwtHelper {
  static sign(payload: Record<string, any>) {
    return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN as any });
  }

  static verify(token: string) {
    try {
      return jwt.verify(token, SECRET);
    } catch (error) {
      return null;
    }
  }

  static extractFromHeader(authHeader: string | null) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.split(' ')[1];
  }
}
