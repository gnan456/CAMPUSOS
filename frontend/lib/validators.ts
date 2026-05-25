import { z } from 'zod';
import { Role, ComplaintCategory, LostFoundType } from '../types';

/**
 * Frontend validation schemas mirroring the backend validators.
 * Used with React Hook Form via @hookform/resolvers/zod.
 */

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])/,
      'Must include uppercase, lowercase, number, and special character'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.string().min(1, 'Date is required'),
  venue: z.string().min(2, 'Venue is required'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
});

export const createComplaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.nativeEnum(ComplaintCategory, { message: 'Please select a category' }),
});

export const createNoteSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().optional(),
  subject: z.string().min(2, 'Subject is required'),
  semester: z.number().int().min(1).max(8, 'Semester must be between 1 and 8'),
});

export const createLostFoundSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.nativeEnum(LostFoundType, { message: 'Please select type' }),
  location: z.string().min(2, 'Location is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type CreateComplaintFormData = z.infer<typeof createComplaintSchema>;
export type CreateNoteFormData = z.infer<typeof createNoteSchema>;
export type CreateLostFoundFormData = z.infer<typeof createLostFoundSchema>;
