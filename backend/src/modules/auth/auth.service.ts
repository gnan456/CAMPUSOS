import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import { authRepository } from './auth.repository';
import type { RegisterInput, LoginInput } from './auth.validator';

/**
 * Auth service — business logic layer.
 *
 * Handles registration, login, and token generation/refresh.
 * Never touches HTTP request/response objects.
 * Never queries the database directly (delegates to repository).
 */

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Shape of the user object returned to clients.
 * Matches the Prisma select in the repository.
 */
interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate an access + refresh token pair for a user.
 */
function generateTokens(userId: string, role: string): TokenPair {
  const accessToken = jwt.sign(
    { userId, role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRY as SignOptions['expiresIn'] }
  );

  const refreshToken = jwt.sign(
    { userId, role },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRY as SignOptions['expiresIn'] }
  );

  return { accessToken, refreshToken };
}

export const authService = {
  /**
   * Register a new user.
   *
   * Flow: validate uniqueness → hash password → create user → generate tokens
   */
  async register(input: RegisterInput): Promise<AuthResult> {
    // Check for existing email
    const emailTaken = await authRepository.emailExists(input.email);
    if (emailTaken) {
      throw ApiError.conflict('An account with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

    // Create user
    const user = await authRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: Role.STUDENT,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    return { user, accessToken, refreshToken };
  },

  /**
   * Authenticate a user with email + password.
   *
   * Flow: find user → compare password → generate tokens
   *
   * Security: Uses the same error message for "no user found" and
   * "wrong password" to prevent email enumeration attacks.
   */
  async login(input: LoginInput): Promise<AuthResult> {
    // Find user (includes password for comparison)
    const userWithPassword = await authRepository.findByEmail(input.email);

    if (!userWithPassword) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(input.password, userWithPassword.password);

    if (!passwordMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      userWithPassword.id,
      userWithPassword.role
    );

    // Strip password from response
    const { password: _password, ...user } = userWithPassword;

    return { user, accessToken, refreshToken };
  },

  /**
   * Refresh the access token using a valid refresh token.
   *
   * Flow: verify refresh token → find user (still exists?) → generate new access token
   *
   * We only issue a new access token, NOT a new refresh token.
   * This prevents refresh token rotation attacks while keeping the
   * flow simple. For higher security, implement token rotation with
   * a token family ID stored in the database.
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; user: UserResponse }> {
    let payload: { userId: string; role: string };

    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string; role: string };
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    // Verify user still exists (could have been deleted since token was issued)
    const user = await authRepository.findById(payload.userId);

    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }

    // Generate new access token only
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRY as SignOptions['expiresIn'] }
    );

    return { accessToken, user };
  },

  /**
   * Get current user profile from token payload.
   */
  async getCurrentUser(userId: string): Promise<UserResponse> {
    const user = await authRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  },
};
