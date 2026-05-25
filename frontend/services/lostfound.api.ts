import api from '@/lib/api-client';
import type {
  LostFound,
  CreateLostFoundRequest,
  ApiSuccessResponse,
  PaginationMeta,
  LostFoundType,
} from '@/types';

/**
 * Lost & Found API service.
 */
export const lostFoundApi = {
  async getItems(params?: {
    page?: number;
    limit?: number;
    type?: LostFoundType;
  }): Promise<{ items: LostFound[]; meta: PaginationMeta }> {
    const response = await api.get<
      ApiSuccessResponse<{ items: LostFound[] }>
    >('/lostfound', { params });
    return {
      items: response.data.data.items,
      meta: response.data.meta!,
    };
  },

  async getItem(id: string): Promise<LostFound> {
    const response = await api.get<ApiSuccessResponse<{ item: LostFound }>>(
      `/lostfound/${id}`
    );
    return response.data.data.item;
  },

  async createItem(data: CreateLostFoundRequest): Promise<LostFound> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('type', data.type);
    formData.append('location', data.location);
    if (data.image) formData.append('image', data.image);

    const response = await api.post<ApiSuccessResponse<{ item: LostFound }>>(
      '/lostfound',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data.item;
  },

  async resolveItem(id: string): Promise<LostFound> {
    const response = await api.patch<ApiSuccessResponse<{ item: LostFound }>>(
      `/lostfound/${id}/status`,
      { status: 'RESOLVED' }
    );
    return response.data.data.item;
  },

  async deleteItem(id: string): Promise<void> {
    await api.delete(`/lostfound/${id}`);
  },
};
