import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-lg border bg-bg-base px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-all duration-150',
            'border-border-default focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/15 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            error && 'border-error focus:border-error focus:ring-error/15',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-error font-dm-sans">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
