import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ApiError } from '../utils/ApiError';

/**
 * Role-based access control middleware factory.
 *
 * Returns middleware that checks if the authenticated user's role
 * is in the allowed list. Must be used AFTER authMiddleware.
 *
 * Usage:
 *   router.get('/admin/stats', authMiddleware, roleGuard('ADMIN'), controller.stats)
 *   router.post('/events', authMiddleware, roleGuard('ADMIN', 'CLUB_COORDINATOR'), controller.create)
 */
export const roleGuard = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const userRole = req.user.role as Role;

    if (!allowedRoles.includes(userRole)) {
      throw ApiError.forbidden(
        `Access denied. Required role(s): ${allowedRoles.join(', ')}`
      );
    }

    next();
  };
};
