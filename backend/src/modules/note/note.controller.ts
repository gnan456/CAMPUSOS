import { Request, Response } from 'express';
import { NoteService } from './note.service';
import { ApiResponse } from '@/utils/ApiResponse';
import { asyncHandler } from '@/utils/asyncHandler';
import { ApiError } from '@/utils/ApiError';

const noteService = new NoteService();

export const createNote = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest('Please upload a file');
  }

  // req.file.path contains the Cloudinary URL when using multer-storage-cloudinary
  const fileUrl = req.file.path;
  
  const note = await noteService.createNote(req.body, fileUrl, req.user!.userId);
  res.status(201).json(ApiResponse.ok('Note shared successfully', { note }));
});

export const getNotes = asyncHandler(async (req: Request, res: Response) => {
  const { notes, meta } = await noteService.getNotes(req.query);
  res.status(200).json(ApiResponse.paginated('Notes retrieved successfully', { notes }, meta));
});

export const getNoteById = asyncHandler(async (req: Request, res: Response) => {
  const note = await noteService.getNoteById((req.params.id as string));
  res.status(200).json(ApiResponse.ok('Note retrieved successfully', { note }));
});

export const deleteNote = asyncHandler(async (req: Request, res: Response) => {
  const result = await noteService.deleteNote((req.params.id as string), req.user!.userId, req.user!.role);
  res.status(200).json(ApiResponse.ok(result.message, result));
});
