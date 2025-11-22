import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import prisma from './Prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return null;
    }

    let decoded;
    try {
      decoded = jwt.verify(token.value, JWT_SECRET);
    } catch (error) {
      console.warn('Token verification failed:', error.message);
      return null;
    }

    const user = await prisma.users.findUnique({
      where: { id: decoded.userId }
    });

    return user;
  } catch (error) {
    console.warn('Auth request failed:', error.message);
    return null;
  }
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}