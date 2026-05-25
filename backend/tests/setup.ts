import { vi, beforeEach } from 'vitest';

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_which_is_very_long';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_which_is_very_long';
process.env.CLOUDINARY_CLOUD_NAME = 'test';
process.env.CLOUDINARY_API_KEY = 'test';
process.env.CLOUDINARY_API_SECRET = 'test';
process.env.OPENAI_API_KEY = 'test';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';

const prismaMock = mockDeep<PrismaClient>();

// Mock the entire Prisma Client
vi.mock('@/config/db', () => ({
  default: prismaMock,
  prisma: prismaMock,
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export { prismaMock };
