'use client';

import { useState, useMemo } from 'react';
import { LogEntry } from '@/lib/types';

interface LogsViewerProps {
  logs: LogEntry[];
}

const levelColors = {
  info: 'text-blue-600 bg-blue-50',
  warn: 'text-yellow-600 bg-yellow-50',
  error: 'text-red-600 bg-red-50',
};

const levelIcons = {
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
};

export function LogsViewer({ logs }: LogsViewerProps) {
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');
  const [search, setSearch] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesFilter = filter === 'all' || log.level === filter;
      const matchesSearch = search === '' || 
        log.message.toLowerCase().includes(search.toLowerCase()) ||
        (log.data && JSON.stringify(log.data).toLowerCase().includes(search.toLowerCase()));
      
      return matchesFilter && matchesSearch;
    });
  }, [logs, filter, search]);

  const levelCounts = useMemo(() => {
    return logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [logs]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
          >
            All ({logs.length})
          </button>
          <button
            onClick={() => setFilter('info')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'info' ? 'bg-blue-100 text-blue-800' : 'bg-muted'
            }`}
          >
            Info ({levelCounts.info || 0})
          </button>
          <button
            onClick={() => setFilter('warn')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'warn' ? 'bg-yellow-100 text-yellow-800' : 'bg-muted'
            }`}
          >
            Warn ({levelCounts.warn || 0})
          </button>
          <button
            onClick={() => setFilter('error')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'error' ? 'bg-red-100 text-red-800' : 'bg-muted'
            }`}
          >
            Error ({levelCounts.error || 0})
          </button>
        </div>
        
        <input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1 border rounded text-sm flex-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Search logs"
        />
      </div>

      {/* Logs List */}
      <div className="border rounded-lg max-h-96 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No logs match the current filter
          </div>
        ) : (
          <div className="divide-y">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-3 hover:bg-muted/50">
                <div className="flex items-start gap-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${levelColors[log.level]}`}>
                    {levelIcons[log.level]} {log.level.toUpperCase()}
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{log.message}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                    {log.data && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                          Show data
                        </summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}