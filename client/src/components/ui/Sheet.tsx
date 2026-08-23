import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: 'top' | 'right' | 'bottom' | 'left';
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ className, children, side = 'right', ...props }, ref) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed z-50 gap-4 bg-gray-900 p-6 shadow-xl transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
          {
            'right-0 top-0 h-full w-[400px] max-w-full border-l border-gray-800 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right':
              side === 'right',
            'left-0 top-0 h-full w-[400px] max-w-full border-r border-gray-800 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left':
              side === 'left',
            'bottom-0 left-0 right-0 h-[50%] max-h-[80%] border-t border-gray-800 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom':
              side === 'bottom',
            'top-0 left-0 right-0 h-[50%] max-h-[80%] border-b border-gray-800 data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top':
              side === 'top',
          },
          className
        )}
        {...props}
      >
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-gray-900 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-800 data-[state=open]:text-white">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
);
SheetContent.displayName = 'SheetContent';

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />;
}

const SheetFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4', className)} {...props} />
  )
);
SheetFooter.displayName = 'SheetFooter';

function SheetTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn('text-lg font-semibold text-white', className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn('text-sm text-gray-400', className)} {...props} />;
}

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription, SheetClose };
