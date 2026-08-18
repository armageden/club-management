import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
}

const sizeStyles = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

const shapeStyles = {
  circle: 'rounded-full',
  square: 'rounded-lg',
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = 'md', shape = 'circle', ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false);

    if (src && !imageError) {
      return (
        <div
          ref={ref}
          className={cn('relative overflow-hidden bg-gray-800', sizeStyles[size], shapeStyles[shape], className)}
          {...props}
        >
          <img
            src={src}
            alt={alt || ''}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
            aria-hidden={!!fallback}
          />
        </div>
      );
    }

    const initials = fallback
      ? fallback
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : '?';

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center font-medium bg-gray-800 text-white',
          sizeStyles[size],
          shapeStyles[shape],
          className
        )}
        {...props}
      >
        {initials}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Avatar Group for overlapping avatars
interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export function AvatarGroup({ className, max = 5, size = 'md', children, ...props }: AvatarGroupProps) {
  const kids = React.Children.toArray(children).slice(0, max);
  const overflow = React.Children.count(children) - max;

  return (
    <div className={cn('flex -space-x-2', className)} {...props}>
      {kids.map((child, index) => (
        <div key={index} className="relative z-[auto]">
          {React.isValidElement(child) ? React.cloneElement(child, { size }) : child}
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            'flex items-center justify-center font-medium bg-gray-700 text-white border-2 border-gray-900',
            sizeStyles[size],
            shapeStyles.circle
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}