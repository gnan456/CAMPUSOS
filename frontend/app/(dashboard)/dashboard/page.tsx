'use client';

import { useEffect, useState } from 'react';
import {
  Calendar,
  MessageSquareWarning,
  FileText,
  Search,
  Bot,
  TrendingUp,
  Users,
  Activity,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Role } from '@/types';
import { eventApi } from '@/services/event.api';
import { complaintApi } from '@/services/complaint.api';
import { noteApi } from '@/services/note.api';
import { lostFoundApi } from '@/services/lostfound.api';
import { analyticsApi } from '@/services/analytics.api';

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  color: string;
}

const quickActions = [
  { label: 'Browse Events', href: '/dashboard/events', icon: Calendar, description: 'View and register for campus events' },
  { label: 'File Complaint', href: '/dashboard/complaints', icon: MessageSquareWarning, description: 'Report an issue on campus' },
  { label: 'Upload Notes', href: '/dashboard/notes', icon: FileText, description: 'Share study resources' },
  { label: 'Lost & Found', href: '/dashboard/lost-found', icon: Search, description: 'Find lost items or report found ones' },
  { label: 'AI Assistant', href: '/dashboard/ai', icon: Bot, description: 'Get help with academics and planning' },
];

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === Role.ADMIN;

  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setLoading(true);
      try {
        if (isAdmin) {
          // Admin: use the analytics endpoint
          const data = await analyticsApi.getDashboardStats();
          if (!cancelled) {
            setStats([
              {
                label: 'Total Users',
                value: data.overview.totalUsers,
                icon: Users,
                color: 'from-violet-600 to-indigo-600',
              },
              {
                label: 'Active Events',
                value: data.overview.totalEvents,
                icon: Calendar,
                color: 'from-emerald-500 to-teal-600',
              },
              {
                label: 'Open Complaints',
                value: data.complaintsStats['OPEN'] ?? 0,
                icon: MessageSquareWarning,
                color: 'from-amber-500 to-orange-600',
              },
              {
                label: 'Platform Activity',
                value: data.overview.totalComplaints,
                icon: Activity,
                color: 'from-sky-500 to-cyan-600',
              },
            ]);
          }
        } else {
          // Student: fetch counts from individual endpoints in parallel
          const [eventsRes, complaintsRes, notesRes, lostFoundRes] =
            await Promise.allSettled([
              eventApi.getEvents({ upcoming: true, limit: 1 }),
              complaintApi.getComplaints({ mine: true, limit: 1 }),
              noteApi.getNotes({ limit: 1 }),
              lostFoundApi.getItems({ limit: 1 }),
            ]);

          const upcomingEvents =
            eventsRes.status === 'fulfilled' ? eventsRes.value.meta?.total ?? 0 : 0;
          const myComplaints =
            complaintsRes.status === 'fulfilled' ? complaintsRes.value.meta?.total ?? 0 : 0;
          const sharedNotes =
            notesRes.status === 'fulfilled' ? notesRes.value.meta?.total ?? 0 : 0;
          const lostItems =
            lostFoundRes.status === 'fulfilled' ? lostFoundRes.value.meta?.total ?? 0 : 0;

          if (!cancelled) {
            setStats([
              {
                label: 'Upcoming Events',
                value: upcomingEvents,
                icon: Calendar,
                color: 'from-violet-600 to-indigo-600',
              },
              {
                label: 'My Complaints',
                value: myComplaints,
                icon: MessageSquareWarning,
                color: 'from-amber-500 to-orange-600',
              },
              {
                label: 'Shared Notes',
                value: sharedNotes,
                icon: FileText,
                color: 'from-emerald-500 to-teal-600',
              },
              {
                label: 'Lost Items',
                value: lostItems,
                icon: Search,
                color: 'from-sky-500 to-cyan-600',
              },
            ]);
          }
        }
      } catch {
        // On any error fall back to dashes
        if (!cancelled) {
          setStats(
            isAdmin
              ? [
                  { label: 'Total Users', value: '—', icon: Users, color: 'from-violet-600 to-indigo-600' },
                  { label: 'Active Events', value: '—', icon: Calendar, color: 'from-emerald-500 to-teal-600' },
                  { label: 'Open Complaints', value: '—', icon: MessageSquareWarning, color: 'from-amber-500 to-orange-600' },
                  { label: 'Platform Activity', value: '—', icon: Activity, color: 'from-sky-500 to-cyan-600' },
                ]
              : [
                  { label: 'Upcoming Events', value: '—', icon: Calendar, color: 'from-violet-600 to-indigo-600' },
                  { label: 'My Complaints', value: '—', icon: MessageSquareWarning, color: 'from-amber-500 to-orange-600' },
                  { label: 'Shared Notes', value: '—', icon: FileText, color: 'from-emerald-500 to-teal-600' },
                  { label: 'Lost Items', value: '—', icon: Search, color: 'from-sky-500 to-cyan-600' },
                ]
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (user) loadStats();

    return () => {
      cancelled = true;
    };
  }, [isAdmin, user]);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          {greeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-slate-400">
          Here&apos;s what&apos;s happening on your campus today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="h-12 w-12 rounded-xl bg-slate-800 shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 w-24 rounded bg-slate-800 mb-3" />
                    <div className="h-6 w-12 rounded bg-slate-700" />
                  </div>
                </CardContent>
              </Card>
            ))
          : stats.map((stat) => (
              <Card key={stat.label} className="group hover:border-slate-700 transition-all duration-300">
                <CardContent className="flex items-center gap-4 p-5">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg opacity-90 group-hover:opacity-100 transition-opacity`}
                  >
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      {stat.trend && (
                        <Badge variant="success" className="text-[10px]">
                          <TrendingUp className="mr-0.5 h-3 w-3" />
                          {stat.trend}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="group cursor-pointer hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 h-full">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400 group-hover:bg-violet-600/15 group-hover:text-violet-400 transition-all duration-300">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-200 group-hover:text-white transition-colors">
                      {action.label}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {action.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
