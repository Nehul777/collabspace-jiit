import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isOnline?: boolean;
}

export function Avatar({ className, src, name, size = 'md', isOnline, ...props }: AvatarProps) {
  const sizes = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
  };

  const dotSizes = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const colors = [
    'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 
    'bg-pink-500', 'bg-rose-500', 'bg-orange-500', 'bg-emerald-500'
  ];
  
  // Simple deterministic color based on name string length for demo
  const colorIndex = name ? name.length % colors.length : 0;
  const bgColor = colors[colorIndex];

  return (
    <div className={cn('relative inline-block', className)} {...props}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full border border-border-subtle bg-surface text-white overflow-hidden',
          sizes[size]
        )}
      >
        {src ? (
          <img src={src} alt={name || 'Avatar'} className="h-full w-full object-cover" />
        ) : (
          <span className={cn('flex h-full w-full items-center justify-center font-medium', bgColor)}>
            {getInitials(name)}
          </span>
        )}
      </div>
      {isOnline !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-canvas',
            isOnline ? 'bg-green-500' : 'bg-gray-500',
            dotSizes[size]
          )}
        />
      )}
    </div>
  );
}

export function AvatarGroup({ className, children, max = 4 }: { className?: string; children: React.ReactNode; max?: number }) {
  const avatars = React.Children.toArray(children);
  const showOverflow = avatars.length > max;
  const visibleAvatars = showOverflow ? avatars.slice(0, max) : avatars;

  return (
    <div className={cn('flex -space-x-3', className)}>
      {visibleAvatars.map((avatar, i) => (
        <div key={i} className="relative ring-2 ring-canvas rounded-full">
          {avatar}
        </div>
      ))}
      {showOverflow && (
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface text-sm font-medium text-text-primary ring-2 ring-canvas">
          +{avatars.length - max}
        </div>
      )}
    </div>
  );
}
