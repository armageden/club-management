import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.ComponentProps<typeof SelectPrimitive.Root> {
  placeholder?: string;
  error?: boolean;
  className?: string;
}

const Select = ({ className, placeholder, error, children, ...props }: SelectProps) => (
    <SelectPrimitive.Root {...props}>
      <SelectPrimitive.Trigger
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-gray-500 data-[error]:border-red-500 data-[error]:focus:ring-red-500',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Content
        className={cn(
          'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-gray-700 bg-gray-900 text-white shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
        )}
        position="popper"
      >
        <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1">
          <ChevronUp className="h-4 w-4" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="p-1">
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1">
          <ChevronDown className="h-4 w-4" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Root>
  );
Select.displayName = SelectPrimitive.Root.displayName;

interface SelectItemProps extends React.ComponentProps<typeof SelectPrimitive.Item> {
  className?: string;
}

const SelectItemComp = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-800 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <span className="h-2 w-2 rounded-full bg-indigo-500" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
);
SelectItemComp.displayName = SelectPrimitive.Item.displayName;

const SelectGroupComp = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof SelectPrimitive.Group>>(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.Group ref={ref} className={cn('[&>label]:px-2 [&>label]:py-1.5 [&>label]:text-xs [&>label]:font-medium [&>label]:text-gray-400', className)} {...props} />
  )
);
SelectGroupComp.displayName = SelectPrimitive.Group.displayName;

const SelectLabelComp = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof SelectPrimitive.Label>>(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.Label ref={ref} className={cn('px-2 py-1.5 text-xs font-medium text-gray-400', className)} {...props} />
  )
);
SelectLabelComp.displayName = SelectPrimitive.Label.displayName;

const SelectSeparatorComp = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof SelectPrimitive.Separator>>(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-gray-800', className)} {...props} />
  )
);
SelectSeparatorComp.displayName = SelectPrimitive.Separator.displayName;

export { Select, SelectItemComp as SelectItem, SelectGroupComp as SelectGroup, SelectLabelComp as SelectLabel, SelectSeparatorComp as SelectSeparator };