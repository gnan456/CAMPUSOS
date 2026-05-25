import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            'flex h-10 w-full rounded-lg border bg-bg-base pl-3.5 pr-10 py-2 text-sm text-text-primary transition-all duration-150 appearance-none',
            'border-border-default focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/15 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer font-dm-sans',
            error && 'border-error focus:border-error focus:ring-error/15',
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-text-secondary">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-error font-dm-sans">{error}</p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };
