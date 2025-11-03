'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

export function StorageManager() {
  const { clearAll } = useStore();

  useEffect(() => {
    // Check if we need to clear storage due to quota issues
    try {
      const testKey = 'storage-test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (error) {
      // Storage quota exceeded, clear everything
      localStorage.clear();
      clearAll();
    }
  }, [clearAll]);

  return null;
}