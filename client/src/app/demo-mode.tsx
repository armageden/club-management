'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  DEMO_EVENT_ID,
  REAL_EVENT_ID,
  isDemoMode,
  setDemoMode,
} from '@/lib/event-id';

interface DemoModeContextType {
  demoMode: boolean;
  activeEventId: string;
  toggleDemoMode: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [demoMode, setDemoModeState] = useState(() => isDemoMode());
  const queryClient = useQueryClient();

  const toggleDemoMode = useCallback(() => {
    const next = !isDemoMode();
    setDemoMode(next);
    setDemoModeState(next);
    // Event id is baked into every query key, so drop the cache and let
    // mounted pages refetch against the other event.
    queryClient.invalidateQueries();
  }, [queryClient]);

  const value: DemoModeContextType = {
    demoMode,
    activeEventId: demoMode ? DEMO_EVENT_ID : REAL_EVENT_ID,
    toggleDemoMode,
  };

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode(): DemoModeContextType {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
}

// Convenience for pages that only need which event to query.
export function useActiveEventId(): string {
  return useDemoMode().activeEventId;
}
