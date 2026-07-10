'use client';

import { createContext, useContext, useId, useState, type ReactNode } from 'react';
import { cn } from '@/lib/class-names';

type TabsContextValue = {
  active: string;
  setActive: (id: string) => void;
  baseId: string;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used within Tabs');
  return ctx;
}

type TabsProps = {
  defaultValue: string;
  children: ReactNode;
  className?: string;
  onChange?: (value: string) => void;
};

export function Tabs({ defaultValue, children, className, onChange }: TabsProps) {
  const baseId = useId();
  const [active, setActiveState] = useState(defaultValue);

  function setActive(id: string) {
    setActiveState(id);
    onChange?.(id);
  }

  return (
    <TabsContext.Provider value={{ active, setActive, baseId }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn(
        'flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface-sunken/80 p-1',
        className,
      )}
    >
      {children}
    </div>
  );
}

type TabTriggerProps = {
  value: string;
  children: ReactNode;
  className?: string;
};

export function TabTrigger({ value, children, className }: TabTriggerProps) {
  const { active, setActive, baseId } = useTabsContext();
  const selected = active === value;

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      onClick={() => setActive(value)}
      className={cn(
        'shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-150',
        selected
          ? 'bg-surface text-ink shadow-sm'
          : 'text-ink-muted hover:text-ink',
        className,
      )}
    >
      {children}
    </button>
  );
}

type TabPanelProps = {
  value: string;
  children: ReactNode;
  className?: string;
};

export function TabPanel({ value, children, className }: TabPanelProps) {
  const { active, baseId } = useTabsContext();
  if (active !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      tabIndex={0}
      className={cn('focus:outline-none', className)}
    >
      {children}
    </div>
  );
}
