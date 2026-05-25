import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

import { Role } from '@prisma/client';

/**
 * JWT payload shape. Kept minimal — only what's needed for
 * authorization decisions. Full user data is fetched from DB
 * only when a controller actually needs it.
 */
export interface JwtPayload {
  userId: string;
  role: Role;
}

/**
 * Extend Express Request to carry the authenticated user payload.
 * This is merged globally so all downstream handlers see `req.user`.
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Authentication middleware.
 *
 * Extracts the JWT from the Authorization header (Bearer scheme),
 * verifies it, and attaches the decoded payload to `req.user`.
 *
 * Throws 401 if:
 * - No token is provided
 * - The token is expired or malformed
 * - The token signature is invalid
 */
export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Access token is required');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw ApiError.unauthorized('Access token is required');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Access token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw ApiError.unauthorized('Invalid access token');
    }
    throw ApiError.unauthorized('Authentication failed');
  }
};
