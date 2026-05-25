import { CheckCircle2 } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-bg-base font-dm-sans">
      {/* Left panel (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 auth-gradient relative flex-col justify-between p-12 overflow-hidden border-r border-border-subtle select-none">
        {/* Top brand */}
        <div className="flex items-center gap-3 relative z-10">
          <svg className="h-7 w-7 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L2 17L12 22L22 17L22 7L12 2Z" stroke="url(#hex-grad-auth)" strokeWidth="2" fill="url(#hex-fill-grad-auth)" />
            <path d="M12 6L6 9L6 15L12 18L18 15L18 9L12 6Z" stroke="var(--brand-secondary)" strokeWidth="1" fill="rgba(56, 189, 248, 0.1)" />
            <defs>
              <linearGradient id="hex-grad-auth" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--brand-primary)" />
                <stop offset="100%" stopColor="var(--brand-secondary)" />
              </linearGradient>
              <linearGradient id="hex-fill-grad-auth" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="var(--brand-secondary)" stopOpacity="0.05" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-xl font-bold font-syne text-text-primary tracking-tight">
            CampusOS
          </span>
        </div>

        {/* Tagline & Features */}
        <div className="my-auto relative z-10 max-w-lg space-y-8">
          <h2 className="text-4xl lg:text-[44px] font-extrabold font-syne text-text-primary leading-[1.1] tracking-tight">
            Your entire campus,<br />in one place.
          </h2>
          <ul className="space-y-4">
            {[
              'Gemini-powered campus chatbot & scheduler',
              'Fast & retroactive events administration',
              'Peer-to-peer study resources sharing',
              'Real-time complaint tracking & resolving'
            ].map((text, idx) => (
              <li key={idx} className="flex items-center gap-3 text-text-secondary">
                <CheckCircle2 className="h-5 w-5 text-brand-secondary shrink-0" />
                <span className="text-sm font-medium leading-normal">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Abstract vector glow overlays */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-brand-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-20 -left-20 w-60 h-60 rounded-full bg-brand-secondary/5 blur-[80px] pointer-events-none" />

        {/* Footer */}
        <p className="text-xs text-text-muted relative z-10">
          © {new Date().getFullYear()} CampusOS. Built for modern university life.
        </p>
      </div>

      {/* Right panel (form area) */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-20 relative z-10 overflow-y-auto bg-bg-base">
        {/* Mobile Header (hidden on desktop) */}
        <div className="flex items-center gap-2.5 mb-8 lg:hidden justify-center">
          <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L2 17L12 22L22 17L22 7L12 2Z" stroke="url(#hex-grad-mob)" strokeWidth="2" fill="url(#hex-fill-grad-mob)" />
            <defs>
              <linearGradient id="hex-grad-mob" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--brand-primary)" />
                <stop offset="100%" stopColor="var(--brand-secondary)" />
              </linearGradient>
              <linearGradient id="hex-fill-grad-mob" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="var(--brand-secondary)" stopOpacity="0.05" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-lg font-bold font-syne text-text-primary tracking-tight">
            CampusOS
          </span>
        </div>

        <div className="mx-auto w-full max-w-md page-enter">
          {children}
        </div>
      </div>
    </div>
  );
}
