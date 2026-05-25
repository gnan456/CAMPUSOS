import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * Rate limiter presets for different route categories.
 * 
 * Auth routes: strict (10 requests / 15 min) — brute-force protection.
 * AI routes:   moderate (20 requests / 60 min) — cost control + abuse prevention.
 * General:     lenient (100 requests / 15 min) — standard API abuse prevention.
 * 
 * In development mode, limits are relaxed by 100x to prevent developer blocks during local testing.
 */

const isDev = env.NODE_ENV === 'development';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : 10,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,    // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,     // Disable X-RateLimit-* headers
  skipSuccessfulRequests: false,
});

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDev ? 2000 : 20,
  message: {
    success: false,
    message: 'AI request limit reached. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit per user, not per IP (requires auth middleware upstream)
    return req.user?.userId ?? req.ip ?? 'unknown';
  },
});

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : 100,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
