import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging Tailwind classes safely.
 * Uses clsx for conditional class joining and tailwind-merge
 * to resolve conflicting Tailwind utility classes.
 *
 * Example: cn('px-4 py-2', isActive && 'bg-blue-500', 'px-6')
 * → 'py-2 px-6 bg-blue-500' (px-6 wins over px-4)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
