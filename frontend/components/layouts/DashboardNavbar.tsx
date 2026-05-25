'use client';

import { useRouter } from 'next/navigation';
import { Bell, LogOut, User, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';
import { useUIStore } from '@/store/ui.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

/**
 * Dashboard top navigation bar.
 * Shows user info, notification bell with unread count, and logout.
 */
export function DashboardNavbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const roleLabel: Record<string, string> = {
    STUDENT: 'Student',
    ADMIN: 'Admin',
    CLUB_COORDINATOR: 'Coordinator',
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm px-6">
      {/* Left — Hamburger menu on mobile */}
      <div className="flex items-center md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          className="text-slate-400 hover:text-slate-200 mr-2"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      <div className="hidden md:block" />

      {/* Right — User actions */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => router.push('/dashboard/notifications')}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>

        {/* User Info */}
        <div className="flex items-center gap-3 rounded-lg bg-slate-900/60 px-3 py-1.5 border border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-xs font-bold">
            {user?.name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-200 leading-tight">
              {user?.name}
            </p>
            <Badge variant="default" className="mt-0.5 text-[10px] py-0 px-1.5">
              {roleLabel[user?.role || ''] || user?.role}
            </Badge>
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          aria-label="Logout"
          className="text-slate-400 hover:text-red-400"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
