import { z } from 'zod';

export const chatSchema = {
  body: z.object({
    message: z.string().min(1, 'Message cannot be empty').max(1000),
  }),
};

export const summarizeSchema = {
  body: z.object({
    noticeText: z.string().min(10, 'Text must be at least 10 characters').max(5000),
  }),
};

export const timetableSchema = {
  body: z.object({
    subjects: z.array(z.string()).min(1, 'At least one subject is required'),
    preferences: z.record(z.string()).optional(),
  }),
};

export type ChatInput = z.infer<typeof chatSchema['body']>;
export type SummarizeInput = z.infer<typeof summarizeSchema['body']>;
export type TimetableInput = z.infer<typeof timetableSchema['body']>;
