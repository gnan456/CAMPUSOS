import { z } from 'zod';

export const getNotificationParamsSchema = {
  params: z.object({
    id: z.string().cuid('Invalid notification ID'),
  }),
};

export const getNotificationsQuerySchema = {
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number),
    limit: z.string().regex(/^\d+$/).optional().transform(Number),
    unreadOnly: z.enum(['true', 'false']).optional().transform((val) => val === 'true'),
  }),
};
