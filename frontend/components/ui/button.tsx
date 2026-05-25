import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer font-dm-sans',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-primary text-white hover:brightness-110 hover:shadow-glow-sm active:scale-[0.98]',
        secondary:
          'bg-bg-elevated border border-border-default text-text-primary hover:border-border-strong hover:bg-bg-overlay active:scale-[0.98]',
        ghost:
          'bg-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary',
        danger:
          'bg-error text-white hover:brightness-110 active:scale-[0.98] focus-visible:ring-error',
        outline:
          'bg-transparent border border-brand-primary text-brand-primary hover:bg-brand-glow/10 active:scale-[0.98]',
      },
      size: {
        default: 'h-10 px-5 py-2 rounded-lg',
        sm: 'h-8 px-3 rounded-md text-xs',
        lg: 'h-12 px-8 rounded-lg text-base',
        icon: 'h-10 w-10 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }), isLoading && 'opacity-70')}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <svg
              className="h-4 w-4 animate-spin text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{children}</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
