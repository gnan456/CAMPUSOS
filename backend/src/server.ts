import app from './app';
import { env } from './config/env';
import { prisma } from './config/db';

/**
 * Server entry point.
 *
 * 1. Validates environment variables (crashes if invalid — see config/env.ts)
 * 2. Tests database connectivity via Prisma
 * 3. Starts the HTTP server
 * 4. Registers graceful shutdown handlers
 */
async function bootstrap(): Promise<void> {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Start server
    const server = app.listen(env.PORT, () => {
      console.log(`🚀 CampusOS API running on port ${env.PORT}`);
      console.log(`📌 Environment: ${env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${env.PORT}/api/v1/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      
      server.close(() => {
        console.log('🔒 HTTP server closed');
      });

      await prisma.$disconnect();
      console.log('🔒 Database connection closed');
      
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();
