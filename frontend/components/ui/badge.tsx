import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium font-mono border transition-all duration-150',
  {
    variants: {
      variant: {
        default: 'bg-brand-primary/10 text-brand-primary border-brand-primary/25',
        success: 'bg-success/10 text-success border-success/25',
        warning: 'bg-warning/10 text-warning border-warning/25',
        error: 'bg-error/10 text-error border-error/25',
        ghost: 'bg-bg-elevated text-text-secondary border-border-subtle',
        student: 'bg-role-student/10 text-role-student border-role-student/25',
        coordinator: 'bg-role-coordinator/10 text-role-coordinator border-role-coordinator/25',
        admin: 'bg-role-admin/10 text-role-admin border-role-admin/25',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
