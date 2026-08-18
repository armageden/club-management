'use client';

import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description?: string;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable
    ) {
      // Allow shortcuts with Ctrl/Cmd in inputs for copy/paste etc
      if (!(event.ctrlKey || event.metaKey)) return;
    }

    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = (shortcut.ctrlKey ?? false) === event.ctrlKey;
      const metaMatches = (shortcut.metaKey ?? false) === event.metaKey;
      const shiftMatches = (shortcut.shiftKey ?? false) === event.shiftKey;
      const altMatches = (shortcut.altKey ?? false) === event.altKey;

      if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.action();
        break;
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (!enabled) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}

export function useGlobalShortcuts() {
  // This hook can be used to register global shortcuts that work everywhere
  // Shortcuts are registered via the useKeyboardShortcuts hook in components
}

export function useShortcutsHelp(shortcuts: KeyboardShortcut[]) {
  return shortcuts.filter(s => s.description).map(s => ({
    keys: [
      s.ctrlKey && 'Ctrl',
      s.metaKey && '⌘',
      s.shiftKey && 'Shift',
      s.altKey && 'Alt',
      s.key.toUpperCase(),
    ].filter(Boolean).join(' + '),
    description: s.description!,
  }));
}

// Pre-defined common shortcuts
export const COMMON_SHORTCUTS = {
  NEW: { key: 'n', metaKey: true, description: 'Create new' },
  SAVE: { key: 's', metaKey: true, description: 'Save' },
  SEARCH: { key: 'k', metaKey: true, description: 'Open search' },
  HELP: { key: '/', metaKey: true, shiftKey: true, description: 'Show shortcuts' },
  ESCAPE: { key: 'Escape', description: 'Close modal/dropdown' },
} as const;