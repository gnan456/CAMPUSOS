import { z } from 'zod';
import { EventStatus } from '@prisma/client';

export const createEventSchema = {
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    date: z.string().datetime({ message: 'Must be a valid ISO 8601 date string' }),
    venue: z.string().min(2, 'Venue is required'),
    capacity: z.number().int().min(1, 'Capacity must be at least 1'),
    imageUrl: z.string().url().optional(),
  }),
};

export const updateEventStatusSchema = {
  body: z.object({
    status: z.nativeEnum(EventStatus),
  }),
  params: z.object({
    id: z.string().cuid('Invalid event ID'),
  }),
};

export const getEventParamsSchema = {
  params: z.object({
    id: z.string().cuid('Invalid event ID'),
  }),
};

export const getEventsQuerySchema = {
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number),
    limit: z.string().regex(/^\d+$/).optional().transform(Number),
    status: z.nativeEnum(EventStatus).optional(),
    upcoming: z.enum(['true', 'false']).optional().transform((val) => val === 'true'),
  }),
};

export type CreateEventInput = z.infer<typeof createEventSchema['body']>;
export type UpdateEventStatusInput = z.infer<typeof updateEventStatusSchema['body']>;
