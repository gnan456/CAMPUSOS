'use client';

import { BarChart3, TrendingUp, Users, Activity, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { Role } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function AnalyticsPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== Role.ADMIN) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (user?.role !== Role.ADMIN) return null;

  // Custom visual data for categories bar chart
  const categoriesData = [
    { label: 'Infra', value: 24, height: 120, color: 'var(--brand-primary)' },
    { label: 'Acad', value: 12, height: 60, color: 'var(--brand-secondary)' },
    { label: 'Hostel', value: 36, height: 180, color: '#a78bfa' },
    { label: 'Food', value: 8, height: 40, color: '#f59e0b' },
    { label: 'Lib', value: 5, height: 25, color: '#10b981' },
    { label: 'Trans', value: 16, height: 80, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8 font-dm-sans">
      {/* Title */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold font-syne text-text-primary tracking-tight flex items-center gap-2.5">
          <BarChart3 className="h-7 w-7 text-brand-primary shrink-0" />
          Platform Analytics
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Real-time system health, registrations, and user interaction insights
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* KPI 1 */}
        <Card variant="elevated" className="group">
          <CardContent className="p-5 flex flex-col justify-between h-full min-h-[116px]">
            <div className="flex items-center justify-between w-full">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
                <Users className="h-5 w-5" />
              </div>
              <Badge variant="success" className="text-[9px] py-0 px-1 font-mono">
                <TrendingUp className="mr-0.5 h-3 w-3" />
                +12%
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-[28px] font-bold font-mono text-text-primary leading-none tracking-tight">1,248</p>
              <p className="text-[13px] font-dm-sans text-text-secondary mt-1.5 leading-none font-medium">Total Users</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2 */}
        <Card variant="elevated" className="group">
          <CardContent className="p-5 flex flex-col justify-between h-full min-h-[116px]">
            <div className="flex items-center justify-between w-full">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/10 border border-warning/20 text-warning">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <Badge variant="ghost" className="text-[9px] py-0 px-1 font-mono text-rose-400 border-rose-500/20 bg-rose-500/10">
                Active
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-[28px] font-bold font-mono text-text-primary leading-none tracking-tight">42</p>
              <p className="text-[13px] font-dm-sans text-text-secondary mt-1.5 leading-none font-medium">Open Complaints</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3 */}
        <Card variant="elevated" className="group">
          <CardContent className="p-5 flex flex-col justify-between h-full min-h-[116px]">
            <div className="flex items-center justify-between w-full">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10 border border-success/20 text-success">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-[9px] font-mono text-text-muted">8 upcoming</span>
            </div>
            <div className="mt-4">
              <p className="text-[28px] font-bold font-mono text-text-primary leading-none tracking-tight">156</p>
              <p className="text-[13px] font-dm-sans text-text-secondary mt-1.5 leading-none font-medium">Total Events</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4 */}
        <Card variant="elevated" className="group">
          <CardContent className="p-5 flex flex-col justify-between h-full min-h-[116px]">
            <div className="flex items-center justify-between w-full">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-secondary/10 border border-brand-secondary/20 text-brand-secondary">
                <BarChart3 className="h-5 w-5" />
              </div>
              <Badge variant="success" className="text-[9px] py-0 px-1 font-mono">
                <TrendingUp className="mr-0.5 h-3 w-3" />
                +24%
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-[28px] font-bold font-mono text-text-primary leading-none tracking-tight">8.4k</p>
              <p className="text-[13px] font-dm-sans text-text-secondary mt-1.5 leading-none font-medium">AI Bot Queries</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual SVG Visualizations */}
      <div className="grid gap-6 lg:grid-cols-2 select-none">
        {/* Manual Bar Chart */}
        <Card variant="default" className="border-border-subtle p-5">
          <CardHeader className="p-0 pb-4">
            <h3 className="text-sm font-bold font-syne text-text-primary uppercase tracking-wider">Complaints by Category</h3>
          </CardHeader>
          <CardContent className="p-0 flex flex-col items-center justify-center h-[260px]">
            <div className="w-full h-full flex items-end justify-between px-4 pb-2 border-b border-border-subtle">
              {categoriesData.map((bar, i) => (
                <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer">
                  {/* Tooltip on hover */}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[10px] font-mono bg-bg-overlay border border-border-default px-1.5 py-0.5 rounded text-text-primary -translate-y-1">
                    {bar.value}
                  </span>
                  <div
                    className="w-8 rounded-t-sm transition-all duration-300 hover:brightness-110"
                    style={{
                      height: `${bar.height}px`,
                      backgroundColor: bar.color,
                    }}
                  />
                  <span className="text-[11px] font-mono text-text-secondary mt-1">{bar.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Manual Spline area line chart */}
        <Card variant="default" className="border-border-subtle p-5">
          <CardHeader className="p-0 pb-4">
            <h3 className="text-sm font-bold font-syne text-text-primary uppercase tracking-wider">Monthly Platform Activity</h3>
          </CardHeader>
          <CardContent className="p-0 flex flex-col justify-center h-[260px] relative">
            {/* Custom SVG line graph */}
            <svg viewBox="0 0 400 200" className="w-full h-full">
              <defs>
                <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--brand-primary)" />
                  <stop offset="100%" stopColor="var(--brand-secondary)" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              <line x1="30" y1="30" x2="370" y2="30" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="3" />
              <line x1="30" y1="80" x2="370" y2="80" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="3" />
              <line x1="30" y1="130" x2="370" y2="130" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="3" />
              <line x1="30" y1="180" x2="370" y2="180" stroke="var(--border-default)" strokeWidth="1" />

              {/* Area path */}
              <path
                d="M 30 180 Q 90 120 150 150 T 270 90 T 370 40 L 370 180 Z"
                fill="url(#area-grad)"
              />

              {/* Spline Path */}
              <path
                d="M 30 180 Q 90 120 150 150 T 270 90 T 370 40"
                fill="none"
                stroke="url(#line-grad)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Dot Indicators */}
              <circle cx="150" cy="150" r="4.5" fill="var(--brand-primary)" stroke="var(--bg-surface)" strokeWidth="2" />
              <circle cx="270" cy="90" r="4.5" fill="var(--brand-secondary)" stroke="var(--bg-surface)" strokeWidth="2" />
              <circle cx="370" cy="40" r="4.5" fill="var(--brand-secondary)" stroke="var(--bg-surface)" strokeWidth="2" />

              {/* Axis labels */}
              <text x="30" y="196" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">Jan</text>
              <text x="110" y="196" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">Feb</text>
              <text x="190" y="196" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">Mar</text>
              <text x="270" y="196" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">Apr</text>
              <text x="350" y="196" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">May</text>
            </svg>
          </CardContent>
        </Card>
      </div>

      {/* User Growth & Platform Health table */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold font-syne text-text-muted tracking-widest uppercase select-none">Recent User Registrations</h2>
        <Card variant="default" className="border-border-subtle overflow-hidden">
          <CardContent className="p-0 overflow-x-auto scrollbar-none">
            <table className="w-full text-left border-collapse min-w-[600px] font-dm-sans">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-surface text-xs font-semibold text-text-secondary select-none">
                  <th className="p-4 font-syne">Name</th>
                  <th className="p-4 font-syne">Email Address</th>
                  <th className="p-4 font-syne">Account Role</th>
                  <th className="p-4 font-syne">System Status</th>
                  <th className="p-4 font-syne">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50 text-sm">
                {[
                  { name: 'Aditya Varma', email: 'aditya.varma@university.edu', role: 'STUDENT', badge: 'student', status: 'Active', date: 'May 24, 2026' },
                  { name: 'Sneha Patel', email: 'sneha.patel@university.edu', role: 'CLUB_COORDINATOR', badge: 'coordinator', status: 'Active', date: 'May 22, 2026' },
                  { name: 'Dr. Ramesh Kumar', email: 'ramesh.kumar@university.edu', role: 'ADMIN', badge: 'admin', status: 'Active', date: 'May 18, 2026' },
                  { name: 'Vikram Singh', email: 'vikram.singh@university.edu', role: 'STUDENT', badge: 'student', status: 'Suspended', date: 'May 15, 2026' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-bg-elevated/20 transition-colors">
                    <td className="p-4 font-semibold text-text-primary">{row.name}</td>
                    <td className="p-4 text-text-secondary font-mono text-xs">{row.email}</td>
                    <td className="p-4">
                      <Badge variant={row.badge as any}>{row.role.replace('_', ' ')}</Badge>
                    </td>
                    <td className="p-4 select-none">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-medium",
                        row.status === 'Active' ? 'text-success' : 'text-text-muted'
                      )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", row.status === 'Active' ? 'bg-success' : 'bg-text-muted')} />
                        {row.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-mono text-text-secondary">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
