import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'removable' | 'selectable';
  selected?: boolean;
  onRemove?: () => void;
  onSelect?: () => void;
}

export function Tag({
  className,
  variant = 'default',
  selected = false,
  onRemove,
  onSelect,
  children,
  ...props
}: TagProps) {
  const isInteractive = variant === 'selectable' || variant === 'removable';

  return (
    <span
      onClick={variant === 'selectable' ? onSelect : undefined}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-mono transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
        isInteractive && 'cursor-pointer hover:scale-[1.02]',
        selected
          ? 'bg-accent/20 text-accent border border-accent/30'
          : 'bg-surface text-text-primary border border-border-subtle',
        !selected && isInteractive && 'hover:bg-elevated hover:border-border-strong',
        className
      )}
      {...props}
    >
      {children}
      {variant === 'removable' && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-1.5 -mr-1 rounded-full p-0.5 text-current opacity-70 hover:opacity-100 hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Remove"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
