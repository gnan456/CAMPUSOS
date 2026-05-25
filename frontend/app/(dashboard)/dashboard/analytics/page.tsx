'use client';

import { BarChart3, TrendingUp, Users, Activity, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { Role } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AnalyticsPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== Role.ADMIN) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (user?.role !== Role.ADMIN) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-violet-400" />
          Platform Analytics
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          System-wide metrics and engagement reports
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-400 font-medium">Total Users</p>
                <p className="text-2xl font-bold text-white mt-2">1,248</p>
              </div>
              <div className="p-2 bg-violet-500/10 rounded-lg">
                <Users className="h-5 w-5 text-violet-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-emerald-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-400 font-medium">Active Complaints</p>
                <p className="text-2xl font-bold text-white mt-2">42</p>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-rose-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+5% from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-400 font-medium">Total Events</p>
                <p className="text-2xl font-bold text-white mt-2">156</p>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Activity className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-slate-400">
              <span>8 upcoming this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-400 font-medium">AI Queries</p>
                <p className="text-2xl font-bold text-white mt-2">8.4k</p>
              </div>
              <div className="p-2 bg-sky-500/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-sky-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-emerald-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+24% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-800 bg-slate-900/50 min-h-[300px] flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Engagement Chart</p>
            <p className="text-xs text-slate-500">Connect Recharts or Chart.js for data visualization</p>
          </div>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50 min-h-[300px] flex items-center justify-center">
          <div className="text-center">
            <Activity className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Resolution Times</p>
            <p className="text-xs text-slate-500">Connect Recharts or Chart.js for data visualization</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
