import { Router } from 'express';
import {
  chat,
  getChatHistory,
  summarize,
  generateTimetable,
} from './ai.controller';
import {
  chatSchema,
  summarizeSchema,
  timetableSchema,
} from './ai.validator';
import { authMiddleware } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { aiRateLimiter } from '@/middleware/ratelimit.middleware';

const router = Router();

// Apply auth middleware to all AI routes
router.use(authMiddleware);

// AI features are expensive, use a stricter rate limiter (aiRateLimiter)
router.use(aiRateLimiter);

// GET routes
router.get('/chat/history', getChatHistory);

// POST routes
router.post('/chat', validate(chatSchema), chat);
router.post('/summarize', validate(summarizeSchema), summarize);
router.post('/timetable', validate(timetableSchema), generateTimetable);

export default router;
