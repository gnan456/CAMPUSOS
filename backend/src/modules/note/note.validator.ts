import { z } from 'zod';

// We validate the text fields that Multer extracts from FormData
export const createNoteSchema = {
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().optional(),
    subject: z.string().min(2, 'Subject is required'),
    semester: z.string().regex(/^[1-8]$/, 'Semester must be between 1 and 8').transform(Number),
  }),
};

export const getNoteParamsSchema = {
  params: z.object({
    id: z.string().cuid('Invalid note ID'),
  }),
};

export const getNotesQuerySchema = {
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number),
    limit: z.string().regex(/^\d+$/).optional().transform(Number),
    subject: z.string().optional(),
    semester: z.string().regex(/^[1-8]$/).optional().transform(val => val ? Number(val) : undefined),
  }),
};

export type CreateNoteInput = z.infer<typeof createNoteSchema['body']>;
