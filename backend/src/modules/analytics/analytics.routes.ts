import { Router } from 'express';
import { getDashboardStats } from './analytics.controller';
import { authMiddleware } from '@/middleware/auth.middleware';
import { roleGuard } from '@/middleware/role.middleware';
import { generalRateLimiter } from '@/middleware/ratelimit.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Apply auth middleware to all analytics routes
router.use(authMiddleware);
router.use(generalRateLimiter);

// ONLY admins can access analytics
router.use(roleGuard(Role.ADMIN));

router.get('/dashboard', getDashboardStats);

export default router;
