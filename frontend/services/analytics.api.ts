import api from '@/lib/api-client';
import type { ApiSuccessResponse } from '@/types';

export interface DashboardStats {
  overview: {
    totalUsers: number;
    totalEvents: number;
    totalComplaints: number;
  };
  complaintsStats: Record<string, number>;
  recentActivity: {
    events: { id: string; title: string; status: string; date: string }[];
    complaints: { id: string; title: string; status: string; category: string }[];
  };
}

export const analyticsApi = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<ApiSuccessResponse<DashboardStats>>(
      '/analytics/dashboard'
    );
    return response.data.data;
  },
};
