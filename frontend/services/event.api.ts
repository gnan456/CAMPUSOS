import api from '@/lib/api-client';
import type {
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  ApiSuccessResponse,
  PaginationMeta,
} from '@/types';

/**
 * Event API service — all event-related HTTP calls.
 */
export const eventApi = {
  async getEvents(params?: {
    page?: number;
    limit?: number;
    status?: string;
    upcoming?: boolean;
  }): Promise<{ events: Event[]; meta: PaginationMeta }> {
    const response = await api.get<
      ApiSuccessResponse<{ events: Event[] }>
    >('/events', { params });
    return {
      events: response.data.data.events,
      meta: response.data.meta!,
    };
  },

  async getEvent(id: string): Promise<Event> {
    const response = await api.get<ApiSuccessResponse<{ event: Event }>>(
      `/events/${id}`
    );
    return response.data.data.event;
  },

  async createEvent(data: CreateEventRequest): Promise<Event> {
    const response = await api.post<ApiSuccessResponse<{ event: Event }>>(
      '/events',
      data
    );
    return response.data.data.event;
  },

  async updateEvent(id: string, data: UpdateEventRequest): Promise<Event> {
    const response = await api.patch<ApiSuccessResponse<{ event: Event }>>(
      `/events/${id}`,
      data
    );
    return response.data.data.event;
  },

  async updateEventStatus(id: string, status: string): Promise<Event> {
    const response = await api.patch<ApiSuccessResponse<{ event: Event }>>(
      `/events/${id}/status`,
      { status }
    );
    return response.data.data.event;
  },

  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/events/${id}`);
  },

  async registerForEvent(eventId: string): Promise<void> {
    await api.post(`/events/${eventId}/register`);
  },

  async unregisterFromEvent(eventId: string): Promise<void> {
    await api.delete(`/events/${eventId}/register`);
  },
};
