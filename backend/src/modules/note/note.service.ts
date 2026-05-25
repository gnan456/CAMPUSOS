import { Prisma, Role, NotificationType } from '@prisma/client';
import { NoteRepository } from './note.repository';
import { ApiError } from '@/utils/ApiError';
import type { CreateNoteInput } from './note.validator';
import { parsePagination } from '@/types';
import cloudinary from '@/config/cloudinary';
import { NotificationService } from '@/modules/notification/notification.service';

export class NoteService {
  private repository: NoteRepository;
  private notificationService: NotificationService;

  constructor() {
    this.repository = new NoteRepository();
    this.notificationService = new NotificationService();
  }

  async createNote(data: CreateNoteInput, fileUrl: string, userId: string) {
    const note = await this.repository.create({
      ...data,
      fileUrl,
      userId,
    });

    // Notify the user that their note was uploaded
    await this.notificationService.createNotification(
      userId,
      'Notes Uploaded',
      `Your notes for "${note.subject}" (Semester ${note.semester}) have been shared successfully.`,
      NotificationType.SYSTEM
    ).catch(() => {});

    return note;
  }

  async getNotes(query: {
    page?: number;
    limit?: number;
    subject?: string;
    semester?: number;
  }) {
    const { skip, take, page } = parsePagination(query as any);
    
    const where: Prisma.NoteWhereInput = {};
    if (query.subject) {
      where.subject = { contains: query.subject, mode: 'insensitive' };
    }
    if (query.semester) {
      where.semester = query.semester;
    }

    const [notes, total] = await Promise.all([
      this.repository.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.repository.count(where),
    ]);

    return {
      notes,
      meta: {
        total,
        page,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async getNoteById(id: string) {
    const note = await this.repository.findById(id);
    if (!note) {
      throw ApiError.notFound('Note not found');
    }
    return note;
  }

  async deleteNote(id: string, userId: string, role: Role) {
    const note = await this.getNoteById(id);

    // Only admins or the author can delete the note
    if (role !== Role.ADMIN && note.userId !== userId) {
      throw ApiError.forbidden('Not authorized to delete this note');
    }

    // Try to extract the public_id from the Cloudinary URL to delete the file
    try {
      // Cloudinary URLs usually look like: https://res.cloudinary.com/.../upload/v12345/folder/file.ext
      const urlParts = note.fileUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2];
      
      if (folder && filename) {
        const publicId = `${folder}/${filename.split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (error) {
      console.error('Failed to delete file from Cloudinary:', error);
      // Proceed with database deletion anyway
    }

    await this.repository.delete(id);
    return { success: true, message: 'Note deleted successfully' };
  }
}
