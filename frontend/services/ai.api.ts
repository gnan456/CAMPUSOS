import api from '@/lib/api-client';
import type {
  AISummarizeRequest,
  AISummarizeResponse,
  AITimetableRequest,
  AITimetableResponse,
  AIChatRequest,
  AIChatResponse,
  ApiSuccessResponse,
} from '@/types';

/**
 * AI API service — all AI feature calls.
 * OpenAI is called on the backend only; frontend just sends input.
 */
export const aiApi = {
  async summarize(data: AISummarizeRequest): Promise<AISummarizeResponse> {
    const response = await api.post<ApiSuccessResponse<AISummarizeResponse>>(
      '/ai/summarize',
      data
    );
    return response.data.data;
  },

  async generateTimetable(
    data: AITimetableRequest
  ): Promise<AITimetableResponse> {
    const response = await api.post<ApiSuccessResponse<AITimetableResponse>>(
      '/ai/timetable',
      data
    );
    return response.data.data;
  },

  async chat(data: AIChatRequest): Promise<AIChatResponse> {
    const response = await api.post<ApiSuccessResponse<AIChatResponse>>(
      '/ai/chat',
      data
    );
    return response.data.data;
  },
};
