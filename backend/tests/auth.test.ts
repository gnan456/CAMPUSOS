import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '@/app';
import db from '@/config/db';
import bcrypt from 'bcrypt';

// We need to mock the rate limiter so our tests don't get blocked
vi.mock('@/middleware/ratelimit.middleware', () => ({
  authRateLimiter: (req: any, res: any, next: any) => next(),
  generalRateLimiter: (req: any, res: any, next: any) => next(),
  aiRateLimiter: (req: any, res: any, next: any) => next(),
}));

describe('Auth Module Integration Tests', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'user_1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
        role: 'STUDENT',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { password, ...userWithoutPassword } = mockUser;
      
      // Mock DB: email doesn't exist
      (db as any).user.count.mockResolvedValue(0);
      // Mock DB: create user
      (db as any).user.create.mockResolvedValue(userWithoutPassword as any);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Password123!',
        });

      console.log('500 Error Response:', res.body);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('john@example.com');
      // Ensure password isn't leaked
      expect(res.body.data.user.password).toBeUndefined();
      // Ensure access token is returned
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should fail if email already exists', async () => {
      // Mock DB: email exists
      (db as any).user.count.mockResolvedValue(1);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'existing@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(409); // Conflict
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('An account with this email already exists');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login a user successfully with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const mockUser = {
        id: 'user_1',
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        role: 'STUDENT',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (db as any).user.findUnique.mockResolvedValue(mockUser as any);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'john@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('john@example.com');
      expect(res.body.data.accessToken).toBeDefined();
      
      // Ensure refresh token is set in cookies
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('refreshToken');
    });

    it('should fail with invalid credentials', async () => {
      (db as any).user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'WrongPassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
    });
  });
});
