'use client';

import {
  Command as CommandPrimitive,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from 'cmdk';
import * as DialogPrimitive from '@radix-ui/react-dialog';

function CommandShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('ml-auto text-xs tracking-widest opacity-60', className)} {...props} />;
}
import { Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface CommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function CommandPalette({ open, onOpenChange, children }: CommandProps) {

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content className="fixed left-[50%] top-[15%] z-50 w-[calc(100%-2rem)] max-w-2xl translate-x-[-50%] rounded-xl border border-gray-700 bg-gray-900 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-2">
        <CommandPrimitive className="flex h-full flex-col overflow-hidden">
          <CommandInput
            className="flex h-12 w-full rounded-none border-none bg-transparent py-3 pl-10 pr-4 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Type a command or search..."
          />
          <div className="flex items-center border-b border-gray-800 px-3">
            <Search className="h-4 w-4 text-gray-500" aria-hidden="true" />
          </div>
          <CommandList className="max-h-[400px] overflow-y-auto py-3">
            {children}
          </CommandList>
        </CommandPrimitive>
      </DialogPrimitive.Content>
    </DialogPrimitive.Root>
  );
}

export function CommandGroupWrapper({ heading, children }: { heading?: string; children: React.ReactNode }) {
  return (
    <CommandGroup>
      {heading && <CommandLabel>{heading}</CommandLabel>}
      {children}
    </CommandGroup>
  );
}

export function CommandLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
      {children}
    </div>
  );
}

export function CommandItemComp({ 
  children, 
  onSelect, 
  shortcut, 
  disabled, 
  loading,
  className,
  ...props 
}: React.ComponentProps<typeof CommandItem> & { 
  onSelect?: () => void; 
  shortcut?: string;
  loading?: boolean;
}) {
  return (
    <CommandItem
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-3 py-2 text-sm outline-none transition-colors focus:bg-gray-800 focus:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[selected]:bg-gray-800',
        className
      )}
      onSelect={onSelect}
      disabled={disabled}
      {...props}
    >
      {children}
      {shortcut && <CommandShortcut className="ml-auto text-xs tracking-widest opacity-60">{shortcut}</CommandShortcut>}
      {loading && <Loader2 className="ml-auto h-4 w-4 animate-spin text-gray-500" />}
    </CommandItem>
  );
}

export function CommandSeparatorComp() {
  return <CommandSeparator className="-mx-3 h-px bg-gray-800 my-2" />;
}

export function CommandEmptyComp({ children }: { children: React.ReactNode }) {
  return (
    <CommandEmpty className="py-6 text-center text-sm text-gray-500">
      {children}
    </CommandEmpty>
  );
}