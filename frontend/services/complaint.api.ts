import api from '@/lib/api-client';
import type {
  Complaint,
  CreateComplaintRequest,
  ApiSuccessResponse,
  PaginationMeta,
  ComplaintStatus,
} from '@/types';

/**
 * Complaint API service.
 */
export const complaintApi = {
  async getComplaints(params?: {
    page?: number;
    limit?: number;
    status?: ComplaintStatus;
    mine?: boolean;
  }): Promise<{ complaints: Complaint[]; meta: PaginationMeta }> {
    const response = await api.get<
      ApiSuccessResponse<{ complaints: Complaint[] }>
    >('/complaints', { params });
    return {
      complaints: response.data.data.complaints,
      meta: response.data.meta!,
    };
  },

  async getComplaint(id: string): Promise<Complaint> {
    const response = await api.get<ApiSuccessResponse<{ complaint: Complaint }>>(
      `/complaints/${id}`
    );
    return response.data.data.complaint;
  },

  async createComplaint(data: CreateComplaintRequest): Promise<Complaint> {
    const response = await api.post<ApiSuccessResponse<{ complaint: Complaint }>>(
      '/complaints',
      data
    );
    return response.data.data.complaint;
  },

  async updateComplaintStatus(
    id: string,
    status: ComplaintStatus
  ): Promise<Complaint> {
    const response = await api.patch<ApiSuccessResponse<{ complaint: Complaint }>>(
      `/complaints/${id}`,
      { status }
    );
    return response.data.data.complaint;
  },
};
