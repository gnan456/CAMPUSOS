import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from './notification.controller';
import {
  getNotificationParamsSchema,
  getNotificationsQuerySchema,
} from './notification.validator';
import { authMiddleware } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { generalRateLimiter } from '@/middleware/ratelimit.middleware';

const router = Router();

// Apply auth middleware to all notification routes
router.use(authMiddleware);
router.use(generalRateLimiter);

// GET routes
router.get('/', validate(getNotificationsQuerySchema), getNotifications);
router.get('/unread-count', getUnreadCount);

// PATCH routes
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', validate(getNotificationParamsSchema), markAsRead);

export default router;
