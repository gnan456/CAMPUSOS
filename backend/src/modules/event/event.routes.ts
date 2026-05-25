import { Router } from 'express';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEventStatus,
  registerForEvent,
  unregisterFromEvent,
  deleteEvent,
} from './event.controller';
import {
  createEventSchema,
  updateEventStatusSchema,
  getEventParamsSchema,
  getEventsQuerySchema,
} from './event.validator';
import { authMiddleware } from '@/middleware/auth.middleware';
import { roleGuard } from '@/middleware/role.middleware';
import { validate } from '@/middleware/validate.middleware';
import { generalRateLimiter } from '@/middleware/ratelimit.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Apply auth middleware to all event routes
router.use(authMiddleware);
router.use(generalRateLimiter);

// GET routes
router.get('/', validate(getEventsQuerySchema), getEvents);
router.get('/:id', validate(getEventParamsSchema), getEventById);

// POST routes
// Only admins and club coordinators can create events
router.post(
  '/',
  roleGuard(Role.ADMIN, Role.CLUB_COORDINATOR),
  validate(createEventSchema),
  createEvent
);

// PATCH routes
// Only admins can approve/reject events
router.patch(
  '/:id/status',
  roleGuard(Role.ADMIN),
  validate(updateEventStatusSchema),
  updateEventStatus
);

// Registration routes (Students)
router.post(
  '/:id/register',
  roleGuard(Role.STUDENT),
  validate(getEventParamsSchema),
  registerForEvent
);

router.delete(
  '/:id/register',
  roleGuard(Role.STUDENT),
  validate(getEventParamsSchema),
  unregisterFromEvent
);

// Admin only route to take down an event
router.delete(
  '/:id',
  roleGuard(Role.ADMIN),
  validate(getEventParamsSchema),
  deleteEvent
);

export default router;
