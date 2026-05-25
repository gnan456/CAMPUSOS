import { Router } from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
} from './complaint.controller';
import {
  createComplaintSchema,
  updateComplaintStatusSchema,
  getComplaintParamsSchema,
  getComplaintsQuerySchema,
} from './complaint.validator';
import { authMiddleware } from '@/middleware/auth.middleware';
import { roleGuard } from '@/middleware/role.middleware';
import { validate } from '@/middleware/validate.middleware';
import { generalRateLimiter } from '@/middleware/ratelimit.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Apply auth middleware to all complaint routes
router.use(authMiddleware);
router.use(generalRateLimiter);

// GET routes
router.get('/', validate(getComplaintsQuerySchema), getComplaints);
router.get('/:id', validate(getComplaintParamsSchema), getComplaintById);

// POST routes
router.post('/', validate(createComplaintSchema), createComplaint);

// PATCH routes (Admin only)
router.patch(
  '/:id',
  roleGuard(Role.ADMIN),
  validate(updateComplaintStatusSchema),
  updateComplaintStatus
);

export default router;
