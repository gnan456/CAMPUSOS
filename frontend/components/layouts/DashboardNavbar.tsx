'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Bell, LogOut, User, Menu, Search } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';
import { useUIStore } from '@/store/ui.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Role } from '@/types';

export function DashboardNavbar() {
  const router = useRouter();
  const pathname = usePathname();
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

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'Dashboard';
    const lastSegment = segments[segments.length - 1];
    const mapping: Record<string, string> = {
      dashboard: 'Overview',
      events: 'Events',
      complaints: 'Complaints',
      notes: 'Study Notes',
      'lost-found': 'Lost & Found',
      notifications: 'Notifications',
      ai: 'AI Assistant',
      analytics: 'Analytics',
    };
    return mapping[lastSegment] || lastSegment.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const roleLabel: Record<string, string> = {
    [Role.STUDENT]: 'Student',
    [Role.ADMIN]: 'Admin',
    [Role.CLUB_COORDINATOR]: 'Coordinator',
  };

  const userRole = user?.role as Role | undefined;

  return (
    <header className="flex h-[56px] shrink-0 items-center justify-between border-b border-border-subtle bg-bg-base/80 backdrop-blur-md px-6 sticky top-0 z-30 transition-all duration-150">
      {/* Left — Hamburger menu on mobile & Breadcrumb */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          className="text-text-secondary hover:text-text-primary md:hidden h-8 w-8"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <span className="font-syne font-bold text-text-primary text-base tracking-tight select-none">
          {getBreadcrumbs()}
        </span>
      </div>

      {/* Right — User actions */}
      <div className="flex items-center gap-3">
        {/* Search Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="text-text-secondary hover:text-text-primary h-9 w-9 rounded-lg"
          onClick={() => router.push('/dashboard/lost-found')}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-text-secondary hover:text-text-primary h-9 w-9 rounded-lg"
          onClick={() => router.push('/dashboard/notifications')}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-primary px-1 text-[9px] font-bold text-white font-mono leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>

        {/* Divider */}
        <div className="h-4 w-px bg-border-subtle" />

        {/* User Pill */}
        <div className="flex items-center gap-2 rounded-lg bg-bg-surface px-2.5 py-1 border border-border-subtle shadow-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold font-mono">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-3.5 w-3.5" />}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-text-primary leading-none mb-0.5">
              {user?.name}
            </p>
            <div className="flex leading-none">
              <Badge variant={userRole === Role.ADMIN ? 'admin' : userRole === Role.CLUB_COORDINATOR ? 'coordinator' : 'student'} className="text-[9px] py-0 px-1 font-mono scale-[0.9] origin-left">
                {roleLabel[user?.role || ''] || user?.role}
              </Badge>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-border-subtle" />

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          aria-label="Logout"
          className="text-text-secondary hover:text-error h-9 w-9 rounded-lg"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
