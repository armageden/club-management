import {
  Dialog as DialogPrimitive,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

const Dialog = DialogPrimitive.Root;

const DialogTriggerComp = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = DialogPrimitive.Overlay;

const DialogCloseComp = DialogPrimitive.Close;

const DialogContentComp = DialogPrimitive.Content;

const DialogHeaderComp = DialogPrimitive.Header;

const DialogFooterComp = DialogPrimitive.Footer;

const DialogTitleComp = DialogPrimitive.Title;

const DialogDescriptionComp = DialogPrimitive.Description;

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

export function DialogRoot({ open, onOpenChange, children }: DialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  );
}

export function DialogTriggerButton({ children, ...props }: React.ComponentProps<typeof DialogTrigger>) {
  return <DialogTrigger asChild>{children}</DialogTrigger>;
}

export function DialogContent({
  className,
  children,
  size = 'md',
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogContentComp
        className={cn(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-700 bg-gray-900 p-6 shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
          sizeStyles[size],
          className
        )}
        {...props}
      >
        <DialogCloseComp className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-gray-900 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-800 data-[state=open]:text-white">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogCloseComp>
        {children}
      </DialogContentComp>
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <DialogHeaderComp className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
  );
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <DialogFooterComp className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
  );
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <DialogTitleComp className={cn('text-lg font-semibold text-white', className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <DialogDescriptionComp className={cn('text-sm text-gray-400', className)} {...props} />;
}

export function DialogCloseButton({ children, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <DialogCloseComp asChild>
      <Button variant="ghost" size="sm" {...props}>
        {children}
      </Button>
    </DialogCloseComp>
  );
}