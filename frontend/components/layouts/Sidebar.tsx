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
  GraduationCap,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';
import { Role } from '@/types';

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
        'flex flex-col h-screen shrink-0 border-r border-slate-800 bg-slate-950 transition-all duration-300',
        'fixed inset-y-0 left-0 z-40 md:relative md:translate-x-0',
        sidebarOpen ? 'w-64 translate-x-0' : 'w-16 -translate-x-full md:w-16 md:translate-x-0'
      )}
    >
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-slate-800 px-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          {sidebarOpen && (
            <span className="text-lg font-bold text-white tracking-tight animate-fade-in">
              CampusOS
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
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
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-violet-600/15 text-violet-400 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  )}
                  title={item.label}
                >
                  <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-violet-400')} />
                  {sidebarOpen && (
                    <span className="animate-fade-in">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-slate-800 p-3 hidden md:block">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
