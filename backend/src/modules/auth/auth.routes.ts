import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { authRateLimiter, generalRateLimiter } from '../../middleware/ratelimit.middleware';
import { registerSchema, loginSchema } from './auth.validator';

/**
 * Auth routes.
 *
 * All routes are prefixed with /api/v1/auth (mounted in app.ts).
 *
 * POST /register  → rate-limited, validated, public
 * POST /login     → rate-limited, validated, public
 * POST /refresh   → rate-limited, public (uses httpOnly cookie)
 * POST /logout    → public (just clears cookie)
 * GET  /me        → requires auth token
 */
const router = Router();

// Public routes (with rate limiting on auth endpoints)
router.post(
  '/register',
  authRateLimiter,
  validate({ body: registerSchema }),
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  validate({ body: loginSchema }),
  authController.login
);

router.post(
  '/refresh',
  generalRateLimiter,
  authController.refresh
);

router.post(
  '/logout',
  authController.logout
);

// Protected routes
router.get(
  '/me',
  authMiddleware,
  authController.me
);

export default router;
