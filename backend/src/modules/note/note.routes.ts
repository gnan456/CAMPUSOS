import { Router } from 'express';
import {
  createNote,
  getNotes,
  getNoteById,
  deleteNote,
} from './note.controller';
import {
  createNoteSchema,
  getNoteParamsSchema,
  getNotesQuerySchema,
} from './note.validator';
import { authMiddleware } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { generalRateLimiter } from '@/middleware/ratelimit.middleware';
import { upload } from '@/middleware/upload.middleware';

const router = Router();

// Apply auth middleware to all note routes
router.use(authMiddleware);
router.use(generalRateLimiter);

// GET routes
router.get('/', validate(getNotesQuerySchema), getNotes);
router.get('/:id', validate(getNoteParamsSchema), getNoteById);

// POST routes
// We use multer's upload.single('file') to handle the multipart/form-data
// The 'validate' middleware will run after multer has parsed req.body
router.post(
  '/',
  upload.single('file'),
  validate(createNoteSchema),
  createNote
);

// DELETE routes
router.delete('/:id', validate(getNoteParamsSchema), deleteNote);

export default router;
