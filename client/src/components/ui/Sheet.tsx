import {
  Sheet as SheetPrimitive,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@radix-ui/react-sheet';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetPortal = SheetPrimitive.Portal;
const SheetOverlay = SheetPrimitive.Overlay;

const SheetContent = forwardRef<HTMLDivElement, React.ComponentProps<typeof SheetPrimitive.Content>>(
  ({ className, children, side = 'right', ...props }, ref) => (
    <SheetPortal>
      <SheetOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <SheetPrimitive.Content
        ref={ref}
        className={cn(
          'fixed z-50 gap-4 bg-gray-900 p-6 shadow-xl transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
          {
            'right-0 top-0 h-full w-[400px] max-w-full border-l border-gray-800 data-[state=closed]:slide-in-from-right data-[state=open]:slide-in-from-right':
              side === 'right',
            'left-0 top-0 h-full w-[400px] max-w-full border-r border-gray-800 data-[state=closed]:slide-in-from-left data-[state=open]:slide-in-from-left':
              side === 'left',
            'bottom-0 left-0 right-0 h-[50%] max-h-[80%] border-t border-gray-800 data-[state=closed]:slide-in-from-bottom data-[state=open]:slide-in-from-bottom':
              side === 'bottom',
            'top-0 left-0 right-0 h-[50%] max-h-[80%] border-b border-gray-800 data-[state=closed]:slide-in-from-top data-[state=open]:slide-in-from-top':
              side === 'top',
          },
          className
        )}
        {...props}
      >
        <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-gray-900 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-800 data-[state=open]:text-white">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetClose>
        {children}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeaderComp = forwardRef<HTMLDivElement, React.ComponentProps<typeof SheetHeader>>(
  ({ className, ...props }, ref) => (
    <SheetHeader ref={ref} className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
  )
);
SheetHeaderComp.displayName = SheetHeader.displayName;

const SheetFooter = forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4', className)} {...props} />
  )
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitleComp = forwardRef<HTMLHeadingElement, React.ComponentProps<typeof SheetTitle>>(
  ({ className, ...props }, ref) => (
    <SheetTitle ref={ref} className={cn('text-lg font-semibold text-white', className)} {...props} />
  )
);
SheetTitleComp.displayName = SheetTitle.displayName;

const SheetDescriptionComp = forwardRef<HTMLParagraphElement, React.ComponentProps<typeof SheetDescription>>(
  ({ className, ...props }, ref) => (
    <SheetDescription ref={ref} className={cn('text-sm text-gray-400', className)} {...props} />
  )
);
SheetDescriptionComp.displayName = SheetDescription.displayName;

export { Sheet, SheetTrigger, SheetContent, SheetHeaderComp as SheetHeader, SheetFooter, SheetTitleComp as SheetTitle, SheetDescriptionComp as SheetDescription, SheetClose };