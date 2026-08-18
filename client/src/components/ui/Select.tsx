import {
  Select as SelectPrimitive,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from '@radix-ui/react-select';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.ComponentProps<typeof SelectPrimitive.Root> {
  placeholder?: string;
  error?: boolean;
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ className, placeholder, error, children, ...props }, ref) => (
    <SelectPrimitive.Root ref={ref} className={cn('w-full', className)} {...props}>
      <SelectTrigger
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-gray-500 data-[error]:border-red-500 data-[error]:focus:ring-red-500',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectTrigger>
      <SelectContent
        className={cn(
          'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-gray-700 bg-gray-900 text-white shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
        )}
        position="popper"
      >
        <SelectScrollUpButton className="flex cursor-default items-center justify-center py-1">
          <ChevronUp className="h-4 w-4" />
        </SelectScrollUpButton>
        <SelectPrimitive.Viewport className="p-1">
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton className="flex cursor-default items-center justify-center py-1">
          <ChevronDown className="h-4 w-4" />
        </SelectScrollDownButton>
      </SelectContent>
    </SelectPrimitive.Root>
  )
);
Select.displayName = SelectPrimitive.Root.displayName;

interface SelectItemProps extends React.ComponentProps<typeof SelectItem> {
  className?: string;
}

const SelectItemComp = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, ...props }, ref) => (
    <SelectItem
      ref={ref}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-800 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator asChild>
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
        </SelectPrimitive.ItemIndicator>
      </SelectPrimitive.ItemIndicator>
    </SelectItem>
  )
);
SelectItemComp.displayName = SelectItem.displayName;

const SelectGroupComp = forwardRef<HTMLDivElement, React.ComponentProps<typeof SelectGroup>>(
  ({ className, ...props }, ref) => (
    <SelectGroup ref={ref} className={cn('[&>label]:px-2 [&>label]:py-1.5 [&>label]:text-xs [&>label]:font-medium [&>label]:text-gray-400', className)} {...props} />
  )
);
SelectGroupComp.displayName = SelectGroup.displayName;

const SelectLabelComp = forwardRef<HTMLLabelElement, React.ComponentProps<typeof SelectLabel>>(
  ({ className, ...props }, ref) => (
    <SelectLabel ref={ref} className={cn('px-2 py-1.5 text-xs font-medium text-gray-400', className)} {...props} />
  )
);
SelectLabelComp.displayName = SelectLabel.displayName;

const SelectSeparatorComp = forwardRef<HTMLDivElement, React.ComponentProps<typeof SelectSeparator>>(
  ({ className, ...props }, ref) => (
    <SelectSeparator ref={ref} className={cn('-mx-1 my-1 h-px bg-gray-800', className)} {...props} />
  )
);
SelectSeparatorComp.displayName = SelectSeparator.displayName;

export { Select, SelectItemComp as SelectItem, SelectGroupComp as SelectGroup, SelectLabelComp as SelectLabel, SelectSeparatorComp as SelectSeparator };