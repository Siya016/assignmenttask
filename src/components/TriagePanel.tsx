'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { agentClient } from '@/lib/agentClient';
import { AgentResponse } from '@/lib/types';

export function TriagePanel() {
  const { events, modelEnabled, setModelEnabled, addLog } = useStore();
  const [analysis, setAnalysis] = useState<AgentResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runAnalysis = async () => {
    if (events.length === 0) {
      setAnalysis({ bullets: ['No events to analyze'] });
      return;
    }

    setIsAnalyzing(true);
    addLog({ level: 'info', message: `Starting analysis of ${events.length} events (Model: ${modelEnabled ? 'ON' : 'OFF'})` });

    try {
      const result = await agentClient.analyzeEvents(events, modelEnabled);
      setAnalysis(result);
      
      if (result.aborted) {
        addLog({ level: 'warn', message: 'Analysis was aborted' });
      } else {
        addLog({ 
          level: 'info', 
          message: 'Analysis completed', 
          data: { bulletCount: result.bullets.length, modelUsed: modelEnabled }
        });
      }
    } catch (error) {
      addLog({ level: 'error', message: `Analysis failed: ${error}` });
      setAnalysis({ bullets: ['Analysis failed - using fallback recommendations'] });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAbort = () => {
    agentClient.abort();
    addLog({ level: 'info', message: 'Analysis aborted by user' });
  };

  // Auto-run analysis when events change
  useEffect(() => {
    if (events.length > 0 && !isAnalyzing) {
      runAnalysis();
    }
  }, [events.length]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Operations Triage</h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={modelEnabled}
              onChange={(e) => setModelEnabled(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
              aria-label="Enable AI model"
            />
            <span className={modelEnabled ? 'text-green-600' : 'text-gray-500'}>
              MODEL {modelEnabled ? 'ON' : 'OFF'}
            </span>
          </label>
          
          {isAnalyzing ? (
            <button
              onClick={handleAbort}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Abort analysis"
            >
              Abort
            </button>
          ) : (
            <button
              onClick={runAnalysis}
              disabled={events.length === 0}
              className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Run analysis"
            >
              Analyze
            </button>
          )}
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-card">
        {isAnalyzing ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <span>Analyzing {events.length} events...</span>
          </div>
        ) : analysis ? (
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">
              Recommendations {analysis.aborted ? '(Aborted)' : ''}
            </h3>
            <ul className="space-y-2" role="list">
              {analysis.bullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-sm">{bullet}</span>
                </li>
              ))}
            </ul>
            
            {!modelEnabled && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                Using template-based recommendations. Enable MODEL for AI-powered analysis.
              </div>
            )}
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">
            Upload solar data files to begin analysis
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        Events: {events.length} | High Priority: {events.filter(e => e.severity === 'high').length}
      </div>
    </div>
  );
}