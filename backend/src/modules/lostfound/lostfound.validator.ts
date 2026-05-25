import { z } from 'zod';
import { LostFoundType, LostFoundStatus } from '@prisma/client';

export const createLostFoundSchema = {
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    type: z.nativeEnum(LostFoundType),
    location: z.string().min(2, 'Location is required'),
  }),
};

export const updateLostFoundStatusSchema = {
  body: z.object({
    status: z.nativeEnum(LostFoundStatus),
  }),
  params: z.object({
    id: z.string().cuid('Invalid item ID'),
  }),
};

export const getLostFoundParamsSchema = {
  params: z.object({
    id: z.string().cuid('Invalid item ID'),
  }),
};

export const getLostFoundQuerySchema = {
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number),
    limit: z.string().regex(/^\d+$/).optional().transform(Number),
    type: z.nativeEnum(LostFoundType).optional(),
    status: z.nativeEnum(LostFoundStatus).optional(),
  }),
};

export type CreateLostFoundInput = z.infer<typeof createLostFoundSchema['body']>;
export type UpdateLostFoundStatusInput = z.infer<typeof updateLostFoundStatusSchema['body']>;
