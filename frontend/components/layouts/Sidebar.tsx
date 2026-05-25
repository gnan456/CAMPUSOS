'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  MessageSquareWarning,
  FileText,
  Search,
  Bell,
  Bot,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';
import { Role } from '@/types';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: Role[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: [Role.STUDENT, Role.ADMIN, Role.CLUB_COORDINATOR],
  },
  {
    label: 'Events',
    href: '/dashboard/events',
    icon: Calendar,
    roles: [Role.STUDENT, Role.ADMIN, Role.CLUB_COORDINATOR],
  },
  {
    label: 'Complaints',
    href: '/dashboard/complaints',
    icon: MessageSquareWarning,
    roles: [Role.STUDENT, Role.ADMIN],
  },
  {
    label: 'Notes',
    href: '/dashboard/notes',
    icon: FileText,
    roles: [Role.STUDENT, Role.ADMIN, Role.CLUB_COORDINATOR],
  },
  {
    label: 'Lost & Found',
    href: '/dashboard/lost-found',
    icon: Search,
    roles: [Role.STUDENT, Role.ADMIN, Role.CLUB_COORDINATOR],
  },
  {
    label: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell,
    roles: [Role.STUDENT, Role.ADMIN, Role.CLUB_COORDINATOR],
  },
  {
    label: 'AI Assistant',
    href: '/dashboard/ai',
    icon: Bot,
    roles: [Role.STUDENT, Role.ADMIN, Role.CLUB_COORDINATOR],
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    roles: [Role.ADMIN],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();

  const userRole = user?.role as Role | undefined;
  const filteredItems = navItems.filter(
    (item) => userRole && item.roles.includes(userRole)
  );

  return (
    <aside
      className={cn(
        'flex flex-col h-screen shrink-0 border-r border-border-subtle bg-bg-surface transition-all duration-300',
        'fixed inset-y-0 left-0 z-40 md:relative md:translate-x-0',
        sidebarOpen ? 'w-[240px] translate-x-0' : 'w-[60px] -translate-x-full md:w-[60px] md:translate-x-0'
      )}
    >
      {/* Brand Logo and Text */}
      <div className="flex h-14 items-center border-b border-border-subtle px-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L2 17L12 22L22 17L22 7L12 2Z" stroke="url(#hex-grad)" strokeWidth="2" fill="url(#hex-fill-grad)" />
            <path d="M12 6L6 9L6 15L12 18L18 15L18 9L12 6Z" stroke="var(--brand-secondary)" strokeWidth="1" fill="rgba(56, 189, 248, 0.1)" />
            <defs>
              <linearGradient id="hex-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--brand-primary)" />
                <stop offset="100%" stopColor="var(--brand-secondary)" />
              </linearGradient>
              <linearGradient id="hex-fill-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="var(--brand-secondary)" stopOpacity="0.05" />
              </linearGradient>
            </defs>
          </svg>
          {sidebarOpen && (
            <span className="text-lg font-bold font-syne text-text-primary tracking-tight animate-fade-in">
              CampusOS
            </span>
          )}
        </Link>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={cn(
                    'flex h-10 items-center rounded-lg text-sm font-medium transition-all duration-150 font-dm-sans',
                    sidebarOpen ? 'gap-3 px-3 border-l-3 pl-[9px]' : 'justify-center w-10 mx-auto',
                    isActive
                      ? sidebarOpen
                        ? 'bg-brand-primary/12 text-white border-brand-primary'
                        : 'bg-brand-primary/12 text-brand-primary border-transparent'
                      : 'text-text-secondary border-transparent hover:bg-bg-elevated hover:text-text-primary'
                  )}
                  title={item.label}
                >
                  <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-brand-primary')} />
                  {sidebarOpen && (
                    <span className="animate-fade-in truncate">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className={cn(
        'border-t border-border-subtle p-3 flex items-center',
        sidebarOpen ? 'gap-3' : 'justify-center'
      )}>
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary/20 text-xs font-bold text-brand-primary border border-brand-primary/30 uppercase font-mono">
          {user?.name ? user.name.substring(0, 2) : 'US'}
        </div>
        {sidebarOpen && (
          <div className="flex flex-col min-w-0 animate-fade-in">
            <span className="text-xs font-semibold text-text-primary truncate">
              {user?.name || 'User'}
            </span>
            <div className="mt-0.5">
              <Badge variant={userRole === Role.ADMIN ? 'admin' : userRole === Role.CLUB_COORDINATOR ? 'coordinator' : 'student'}>
                {userRole || 'Student'}
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <div className="border-t border-border-subtle p-3 hidden md:block">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-secondary cursor-pointer"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
