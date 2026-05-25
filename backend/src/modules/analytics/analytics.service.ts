import db from '@/config/db';

export class AnalyticsService {
  async getDashboardStats() {
    const [
      totalUsers,
      totalEvents,
      totalComplaints,
      complaintsByStatus,
      recentEvents,
      recentComplaints,
    ] = await Promise.all([
      db.user.count(),
      db.event.count(),
      db.complaint.count(),
      db.complaint.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
      }),
      db.event.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, status: true, date: true },
      }),
      db.complaint.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, status: true, category: true },
      }),
    ]);

    // Format complaints by status into a more friendly object
    const complaintsStats = complaintsByStatus.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    return {
      overview: {
        totalUsers,
        totalEvents,
        totalComplaints,
      },
      complaintsStats,
      recentActivity: {
        events: recentEvents,
        complaints: recentComplaints,
      },
    };
  }
}
