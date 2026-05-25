import { Router } from 'express';
import {
  createItem,
  getItems,
  getItemById,
  updateItemStatus,
  deleteItem,
} from './lostfound.controller';
import {
  createLostFoundSchema,
  updateLostFoundStatusSchema,
  getLostFoundParamsSchema,
  getLostFoundQuerySchema,
} from './lostfound.validator';
import { authMiddleware } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { generalRateLimiter } from '@/middleware/ratelimit.middleware';
import { upload } from '@/middleware/upload.middleware';

const router = Router();

// Apply auth middleware to all lostfound routes
router.use(authMiddleware);
router.use(generalRateLimiter);

// GET routes
router.get('/', validate(getLostFoundQuerySchema), getItems);
router.get('/:id', validate(getLostFoundParamsSchema), getItemById);

// POST routes
// Multer middleware processes the image upload
router.post(
  '/',
  upload.single('image'),
  validate(createLostFoundSchema),
  createItem
);

// PATCH routes
router.patch(
  '/:id/status',
  validate(updateLostFoundStatusSchema),
  updateItemStatus
);

// DELETE routes
router.delete('/:id', validate(getLostFoundParamsSchema), deleteItem);

export default router;
