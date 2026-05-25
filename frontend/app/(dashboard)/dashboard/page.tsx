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
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Role } from '@/types';
import { eventApi } from '@/services/event.api';
import { complaintApi } from '@/services/complaint.api';
import { noteApi } from '@/services/note.api';
import { lostFoundApi } from '@/services/lostfound.api';
import { analyticsApi } from '@/services/analytics.api';
import { cn } from '@/lib/utils';

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
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

  const userRole = user?.role as Role | undefined;

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setLoading(true);
      try {
        if (isAdmin) {
          const data = await analyticsApi.getDashboardStats();
          if (!cancelled) {
            setStats([
              {
                label: 'Total Users',
                value: data.overview.totalUsers,
                icon: Users,
                trend: '+4%',
              },
              {
                label: 'Active Events',
                value: data.overview.totalEvents,
                icon: Calendar,
                trend: '+8%',
              },
              {
                label: 'Open Complaints',
                value: data.complaintsStats['OPEN'] ?? 0,
                icon: MessageSquareWarning,
                trend: '-2%',
              },
              {
                label: 'Platform Activity',
                value: data.overview.totalComplaints,
                icon: Activity,
                trend: '+15%',
              },
            ]);
          }
        } else {
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
                trend: upcomingEvents > 0 ? '+2' : undefined,
              },
              {
                label: 'My Complaints',
                value: myComplaints,
                icon: MessageSquareWarning,
              },
              {
                label: 'Shared Notes',
                value: sharedNotes,
                icon: FileText,
                trend: '+5',
              },
              {
                label: 'Lost Items',
                value: lostItems,
                icon: Search,
              },
            ]);
          }
        }
      } catch {
        if (!cancelled) {
          setStats(
            isAdmin
              ? [
                  { label: 'Total Users', value: '—', icon: Users },
                  { label: 'Active Events', value: '—', icon: Calendar },
                  { label: 'Open Complaints', value: '—', icon: MessageSquareWarning },
                  { label: 'Platform Activity', value: '—', icon: Activity },
                ]
              : [
                  { label: 'Upcoming Events', value: '—', icon: Calendar },
                  { label: 'My Complaints', value: '—', icon: MessageSquareWarning },
                  { label: 'Shared Notes', value: '—', icon: FileText },
                  { label: 'Lost Items', value: '—', icon: Search },
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold font-syne text-text-primary tracking-tight leading-none">
              {greeting()}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <Badge variant={userRole === Role.ADMIN ? 'admin' : userRole === Role.CLUB_COORDINATOR ? 'coordinator' : 'student'}>
              {userRole === Role.CLUB_COORDINATOR ? 'Coordinator' : userRole === Role.ADMIN ? 'Admin' : 'Student'}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-text-secondary font-dm-sans">
            Here&apos;s what&apos;s happening on your campus today.
          </p>
        </div>
        <div className="text-left sm:text-right select-none">
          <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest leading-none">Current Date</p>
          <p className="text-sm font-semibold font-syne text-text-primary mt-1.5 leading-none">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="skeleton h-[116px] border border-border-subtle" />
            ))
          : stats.map((stat, idx) => {
              const accentColorMap: Record<number, { bg: string; icon: string }> = {
                0: { bg: 'bg-brand-primary/10 border-brand-primary/20', icon: 'text-brand-primary' },
                1: { bg: 'bg-brand-secondary/10 border-brand-secondary/20', icon: 'text-brand-secondary' },
                2: { bg: 'bg-warning/10 border-warning/20', icon: 'text-warning' },
                3: { bg: 'bg-success/10 border-success/20', icon: 'text-success' },
              };
              const styleSet = accentColorMap[idx] || accentColorMap[0];

              return (
                <Card key={stat.label} variant="elevated" className="stagger-item group">
                  <CardContent className="p-5 flex flex-col justify-between h-full min-h-[116px]">
                    <div className="flex items-center justify-between w-full">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full border", styleSet.bg)}>
                        <stat.icon className={cn("h-5 w-5", styleSet.icon)} />
                      </div>
                      {stat.trend ? (
                        <Badge variant="success" className="text-[9px] py-0 px-1 font-mono scale-95 origin-right">
                          <TrendingUp className="mr-0.5 h-3 w-3 shrink-0" />
                          {stat.trend}
                        </Badge>
                      ) : (
                        <span className="text-[9px] font-mono text-text-muted">Live</span>
                      )}
                    </div>
                    <div className="mt-4">
                      <p className="text-[28px] font-bold font-mono text-text-primary leading-none tracking-tight">
                        {stat.value}
                      </p>
                      <p className="text-[13px] font-dm-sans text-text-secondary mt-1.5 leading-none font-medium">
                        {stat.label}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Quick Actions scrollable container */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold font-syne text-text-muted tracking-widest uppercase select-none">Quick Actions</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none snap-x snap-mandatory">
          {quickActions.map((action, idx) => {
            const actionColors = [
              'bg-brand-primary/10 border-brand-primary/20 text-brand-primary hover:shadow-brand-glow-sm',
              'bg-brand-secondary/10 border-brand-secondary/20 text-brand-secondary',
              'bg-role-coordinator/10 border-role-coordinator/20 text-role-coordinator',
              'bg-warning/10 border-warning/20 text-warning',
              'bg-success/10 border-success/20 text-success',
            ];
            const colorClass = actionColors[idx % actionColors.length];

            return (
              <Link key={action.href} href={action.href} className="snap-start shrink-0 w-[280px] sm:w-[320px]">
                <Card variant="elevated" className="h-full group hover:shadow-glow-sm duration-300">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border", colorClass)}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold font-syne text-text-primary group-hover:text-white transition-colors">
                        {action.label}
                      </p>
                      <p className="mt-1.5 text-sm text-text-secondary font-dm-sans leading-normal">
                        {action.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Grid of feed and AI widget */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Timeline updates */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xs font-bold font-syne text-text-muted tracking-widest uppercase select-none">Recent Campus Updates</h2>
          <Card variant="default">
            <CardContent className="p-0">
              <div className="divide-y divide-border-subtle/50">
                {[
                  { title: 'New Event Published', detail: 'Annual Hackathon 2026 registration is now open.', time: '10 mins ago' },
                  { title: 'Complaint Resolved', detail: 'Library Wifi access point issue has been fixed.', time: '2 hours ago' },
                  { title: 'Study Resource Shared', detail: 'Physics Sem-4 Lecture Notes shared by Prof. Sarah.', time: '4 hours ago' },
                  { title: 'Lost Item Reported', detail: 'Black leather wallet found near Cafeteria.', time: '1 day ago' },
                ].map((act, idx) => (
                  <div key={idx} className="flex gap-4 p-4 items-start hover:bg-bg-elevated/40 transition-colors">
                    <div className="relative mt-1 shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-primary ring-4 ring-brand-primary/10" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary leading-tight">{act.title}</p>
                      <p className="text-xs text-text-secondary mt-1 leading-normal font-dm-sans">{act.detail}</p>
                    </div>
                    <span className="text-[10px] font-mono text-text-muted shrink-0 select-none">{act.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Guide tip box */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold font-syne text-text-muted tracking-widest uppercase select-none">AI Guide</h2>
          <Card variant="glass" className="relative overflow-hidden group">
            <CardContent className="p-6 flex flex-col justify-between h-full min-h-[220px]">
              <div className="space-y-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-secondary/15 text-brand-secondary border border-brand-secondary/20">
                  <Bot className="h-5 w-5 animate-bounce" />
                </div>
                <h4 className="text-sm font-bold font-syne text-text-primary">Need academic help?</h4>
                <p className="text-xs text-text-secondary leading-relaxed font-dm-sans">
                  You can ask me to summarize your lecture notes, create personalized study schedules, or explain complex syllabus topics instantly.
                </p>
              </div>
              <Link href="/dashboard/ai" className="mt-4 block w-full">
                <Button variant="outline" className="w-full text-xs py-1.5 h-8 font-dm-sans cursor-pointer">
                  Chat with CampusOS AI
                </Button>
              </Link>
            </CardContent>
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-brand-secondary/10 blur-[30px] group-hover:bg-brand-secondary/20 transition-all duration-300 pointer-events-none" />
          </Card>
        </div>
      </div>
    </div>
  );
}
