import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env';
import { errorMiddleware } from './middleware/error.middleware';
import { generalRateLimiter } from './middleware/ratelimit.middleware';
import authRoutes from './modules/auth/auth.routes';
import eventRoutes from './modules/event/event.routes';
import complaintRoutes from './modules/complaint/complaint.routes';
import noteRoutes from './modules/note/note.routes';
import notificationRoutes from './modules/notification/notification.routes';
import lostFoundRoutes from './modules/lostfound/lostfound.routes';
import aiRoutes from './modules/ai/ai.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';

/**
 * Express application factory.
 *
 * Middleware order matters:
 * 1. Security headers (helmet)
 * 2. CORS
 * 3. Body parsing
 * 4. Cookie parsing
 * 5. Request logging
 * 6. Rate limiting
 * 7. Routes
 * 8. 404 handler
 * 9. Global error handler (MUST be last)
 */
const app = express();

// ─── Security Headers ──────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ──────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,                   // required for httpOnly cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body Parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─── Cookie Parser ─────────────────────────────────────────────────────────
app.use(cookieParser());

// ─── Request Logging ───────────────────────────────────────────────────────
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ─── Global Rate Limiting ──────────────────────────────────────────────────
app.use(generalRateLimiter);

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'CampusOS API is running',
    data: {
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

// ─── Static Files ──────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// ─── API Routes ────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/notes', noteRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/lostfound', lostFoundRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// ─── 404 Handler ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ─── Global Error Handler (must be last) ───────────────────────────────────
app.use(errorMiddleware);

export default app;
