import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', width, height, ...props }, ref) => {
    const variantStyles = {
      text: 'h-4 w-full',
      circular: 'rounded-full',
      rectangular: 'rounded-lg',
      card: 'rounded-xl',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'skeleton',
          variantStyles[variant],
          className
        )}
        style={{ width, height }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export { Skeleton };

// Pre-built skeleton components
export function SkeletonText({ lines = 1, ...props }: { lines?: number } & Omit<SkeletonProps, 'variant'>) {
  return (
    <div className="space-y-2" {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" width={i === lines - 1 ? '60%' : '100%'} />
      ))}
    </div>
  );
}

export function SkeletonCard({ ...props }: SkeletonProps) {
  return (
    <div className="card p-6 space-y-4" {...props}>
      <Skeleton variant="rectangular" height="24" width="40%" />
      <Skeleton variant="rectangular" height="16" width="100%" />
      <Skeleton variant="rectangular" height="16" width="80%" />
      <Skeleton variant="rectangular" height="16" width="60%" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="p-4">
                <Skeleton variant="text" height="16" width="80%" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, row) => (
            <tr key={row}>
              {Array.from({ length: columns }).map((_, col) => (
                <td key={col} className="p-4">
                  <Skeleton variant="text" height="16" width="100%" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonKPI() {
  return (
    <div className="card p-6 space-y-2">
      <Skeleton variant="text" height="14" width="30%" />
      <Skeleton variant="text" height="36" width="50%" />
      <Skeleton variant="text" height="12" width="40%" />
    </div>
  );
}