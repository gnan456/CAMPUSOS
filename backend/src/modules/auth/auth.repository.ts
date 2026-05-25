import { prisma } from '../../config/db';
import { Role } from '@prisma/client';

/**
 * Auth repository — data access layer.
 *
 * ALL database queries for the auth module live here.
 * No business logic, no HTTP concerns — just Prisma calls.
 * This isolation makes it trivial to swap the data source later.
 */

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: Role;
}

/**
 * Fields to return for user objects.
 * Password is explicitly excluded in select queries for safety.
 */
const userPublicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const authRepository = {
  /**
   * Find a user by email. Returns full record INCLUDING password
   * (needed for login comparison). Use with caution.
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  /**
   * Find a user by ID. Returns public fields only (no password).
   */
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: userPublicSelect,
    });
  },

  /**
   * Create a new user. Returns public fields only (no password).
   */
  async create(data: CreateUserData) {
    return prisma.user.create({
      data,
      select: userPublicSelect,
    });
  },

  /**
   * Check if an email is already registered.
   * More efficient than findByEmail when you only need existence.
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { email },
    });
    return count > 0;
  },
};
