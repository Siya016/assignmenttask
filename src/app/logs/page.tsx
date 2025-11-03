'use client';

import { useStore } from '@/lib/store';
import { LogsViewer } from '@/components/LogsViewer';
import { useEffect, useState } from 'react';
import { LogEntry } from '@/lib/types';

export default function LogsPage() {
  const { logs, clearAll } = useStore();
  const [systemLogs, setSystemLogs] = useState<LogEntry[]>([]);

  // Add some initial system logs
  useEffect(() => {
    const initialLogs: LogEntry[] = [
      {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        level: 'info',
        message: '[SYSTEM] Application started',
      },
      {
        id: crypto.randomUUID(),
        timestamp: new Date(Date.now() - 1000),
        level: 'info',
        message: '[SYSTEM] Charts initialized',
      },
    ];
    setSystemLogs(initialLogs);
  }, []);

  const allLogs = [...logs, ...systemLogs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Logs</h1>
          <p className="text-muted-foreground">
            Monitor application events, user actions, and system operations
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setSystemLogs([])}
            className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
          >
            Clear System Logs
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive"
            aria-label="Clear all data and logs"
          >
            Clear All Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
        <div className="bg-card p-3 rounded border">
          <div className="text-muted-foreground">Total Logs</div>
          <div className="text-xl font-semibold">{allLogs.length}</div>
        </div>
        <div className="bg-card p-3 rounded border">
          <div className="text-muted-foreground">User Actions</div>
          <div className="text-xl font-semibold">{logs.length}</div>
        </div>
        <div className="bg-card p-3 rounded border">
          <div className="text-muted-foreground">System Events</div>
          <div className="text-xl font-semibold">{systemLogs.length}</div>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <LogsViewer logs={allLogs} />
      </div>
    </div>
  );
}