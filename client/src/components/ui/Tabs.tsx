import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  variant?: 'default' | 'underline' | 'pills';
  className?: string;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: TabsProps) {
  return (
    <TabsPrimitive.Root
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={cn('w-full', className)}
    >
      {children}
    </TabsPrimitive.Root>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'underline' | 'pills';
}

export function TabsListComp({ children, className, variant = 'default' }: TabsListProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-1 bg-gray-800 p-1 rounded-lg';
  const variantStyles = {
    default: baseStyles,
    underline: 'bg-transparent p-0 border-b border-gray-800',
    pills: baseStyles,
  };

  return (
    <TabsPrimitive.List
      className={cn(
        variantStyles[variant],
        'data-[orientation=horizontal]:flex',
        className
      )}
      aria-orientation="horizontal"
    >
      {children}
    </TabsPrimitive.List>
  );
}

interface TabsTriggerProps extends React.ComponentProps<typeof TabsPrimitive.Trigger> {
  variant?: 'default' | 'underline' | 'pills';
  disabled?: boolean;
}

export function TabsTriggerComp({ className, variant = 'default', disabled, children, ...props }: TabsTriggerProps) {
  const variantStyles = {
    default: 'data-[state=active]:bg-white data-[state=active]:text-gray-950 data-[state=active]:shadow-sm',
    underline: 'bg-transparent text-gray-400 border-b-2 border-transparent data-[state=active]:text-white data-[state=active]:border-indigo-500',
    pills: 'data-[state=active]:bg-white data-[state=active]:text-gray-950 data-[state=active]:shadow-sm',
  };

  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 disabled:pointer-events-none disabled:opacity-50',
        variantStyles[variant],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

interface TabsContentProps extends React.ComponentProps<typeof TabsPrimitive.Content> {
  className?: string;
}

export function TabsContentComp({ className, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Content
      className={cn('mt-4 ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500', className)}
      {...props}
    />
  );
}