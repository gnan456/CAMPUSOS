import { z } from 'zod';
import { ComplaintCategory, ComplaintStatus } from '@prisma/client';

export const createComplaintSchema = {
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(200),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    category: z.nativeEnum(ComplaintCategory),
  }),
};

export const updateComplaintStatusSchema = {
  body: z.object({
    status: z.nativeEnum(ComplaintStatus),
  }),
  params: z.object({
    id: z.string().cuid('Invalid complaint ID'),
  }),
};

export const getComplaintParamsSchema = {
  params: z.object({
    id: z.string().cuid('Invalid complaint ID'),
  }),
};

export const getComplaintsQuerySchema = {
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number),
    limit: z.string().regex(/^\d+$/).optional().transform(Number),
    status: z.nativeEnum(ComplaintStatus).optional(),
    category: z.nativeEnum(ComplaintCategory).optional(),
    mine: z.enum(['true', 'false']).optional().transform((val) => val === 'true'),
  }),
};

export type CreateComplaintInput = z.infer<typeof createComplaintSchema['body']>;
export type UpdateComplaintStatusInput = z.infer<typeof updateComplaintStatusSchema['body']>;
