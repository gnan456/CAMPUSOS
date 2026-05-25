import { GraduationCap } from 'lucide-react';

/**
 * Auth layout — centered card design with gradient background.
 * Used for login and register pages.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-gradient min-h-screen flex flex-col items-center justify-center p-4">
      {/* Floating brand */}
      <div className="mb-8 flex items-center gap-3 animate-fade-in">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25">
          <GraduationCap className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            CampusOS
          </h1>
          <p className="text-xs text-slate-400 -mt-0.5">
            Smart Campus Platform
          </p>
        </div>
      </div>

      {/* Auth card */}
      <div className="w-full max-w-md animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {children}
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-slate-600 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        © {new Date().getFullYear()} CampusOS. Built for modern campuses.
      </p>
    </div>
  );
}
