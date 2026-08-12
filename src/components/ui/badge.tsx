import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'skill' | 'role' | 'status-open' | 'status-progress' | 'status-closed';
  showDot?: boolean;
}

export function Badge({ className, variant = 'default', showDot = false, children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-surface text-text-primary border-border-subtle',
    skill: 'bg-accent/10 text-accent border-accent/20 font-mono',
    role: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'status-open': 'bg-green-500/10 text-green-400 border-green-500/20',
    'status-progress': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'status-closed': 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const dotColors = {
    default: 'bg-text-primary',
    skill: 'bg-accent',
    role: 'bg-emerald-400',
    'status-open': 'bg-green-400',
    'status-progress': 'bg-yellow-400',
    'status-closed': 'bg-red-400',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {showDot && (
        <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', dotColors[variant])} aria-hidden="true" />
      )}
      {children}
    </div>
  );
}
