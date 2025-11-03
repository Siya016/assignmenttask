'use client';

import { useStore } from '@/lib/store';

export function ClearDataButton() {
  const { clearAll } = useStore();

  return (
    <button
      onClick={clearAll}
      className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
    >
      Clear All Data
    </button>
  );
}