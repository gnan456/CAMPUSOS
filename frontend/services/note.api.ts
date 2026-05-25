import api from '@/lib/api-client';
import type {
  Note,
  ApiSuccessResponse,
  PaginationMeta,
} from '@/types';

/**
 * Notes API service.
 * Uses FormData for file uploads (sent to Cloudinary via backend).
 */
export const noteApi = {
  async getNotes(params?: {
    page?: number;
    limit?: number;
    subject?: string;
    semester?: number;
  }): Promise<{ notes: Note[]; meta: PaginationMeta }> {
    const response = await api.get<ApiSuccessResponse<{ notes: Note[] }>>(
      '/notes',
      { params }
    );
    return {
      notes: response.data.data.notes,
      meta: response.data.meta!,
    };
  },

  async getNote(id: string): Promise<Note> {
    const response = await api.get<ApiSuccessResponse<{ note: Note }>>(
      `/notes/${id}`
    );
    return response.data.data.note;
  },

  async createNote(data: {
    title: string;
    description?: string;
    subject: string;
    semester: number;
    file: File;
  }): Promise<Note> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('subject', data.subject);
    formData.append('semester', data.semester.toString());
    formData.append('file', data.file);

    const response = await api.post<ApiSuccessResponse<{ note: Note }>>(
      '/notes',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data.data.note;
  },

  async deleteNote(id: string): Promise<void> {
    await api.delete(`/notes/${id}`);
  },
};
