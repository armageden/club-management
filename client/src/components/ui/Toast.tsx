import { Toaster as SonnerToaster, type ToasterProps } from 'sonner';

export function Toaster(props?: ToasterProps) {
  return (
    <SonnerToaster
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'group toast group-data-[state=open]:animate-in group-data-[state=closed]:animate-out group-data-[swipe=cancel]:translate-x-0 group-data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] group-data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] group-data-[swipe=move]:transition-none group-data-[state=open]:slide-in-from-top-full group-data-[state=closed]:slide-out-to-top-full',
          description: 'text-gray-400',
          actionButton: 'bg-gray-800 hover:bg-gray-700',
          cancelButton: 'bg-gray-800 hover:bg-gray-700',
          closeButton: 'text-gray-400 hover:text-white',
        },
        ...props?.toastOptions,
      }}
      {...props}
    />
  );
}

// Toast wrapper for consistent usage
import { toast as sonnerToast, type ExternalToast } from 'sonner';

interface ToastOptions extends ExternalToast {
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const toast = {
  success: (message: string, options?: ToastOptions) => 
    sonnerToast.success(message, {
      className: 'bg-gray-900 border-gray-700',
      ...options,
    }),
  error: (message: string, options?: ToastOptions) => 
    sonnerToast.error(message, {
      className: 'bg-gray-900 border-gray-700',
      ...options,
    }),
  warning: (message: string, options?: ToastOptions) => 
    sonnerToast.warning(message, {
      className: 'bg-gray-900 border-gray-700',
      ...options,
    }),
  info: (message: string, options?: ToastOptions) => 
    sonnerToast.info(message, {
      className: 'bg-gray-900 border-gray-700',
      ...options,
    }),
  promise: <T,>(promise: Promise<T>, messages: { loading: string; success: string; error: string }, options?: ToastOptions) => 
    sonnerToast.promise(promise, {
      ...messages,
      className: 'bg-gray-900 border-gray-700',
      ...options,
    }),
  dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
};