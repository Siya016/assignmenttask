'use client';

import { RuleEvent, BrushSelection } from '@/lib/types';
import { useStore } from '@/lib/store';

interface EventChipsProps {
  events: RuleEvent[];
}

const severityColors = {
  low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  medium: 'bg-orange-100 text-orange-800 border-orange-200',
  high: 'bg-red-100 text-red-800 border-red-200',
};

const typeLabels = {
  LOW_PF: 'Low PF',
  VOLTAGE_INSTABILITY: 'Voltage',
  IDLE_PERIOD: 'Idle',
};

export function EventChips({ events }: EventChipsProps) {
  const { focusedEvent, setFocusedEvent, setSharedBrush } = useStore();

  const handleChipClick = (event: RuleEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setFocusedEvent(event);
    
    // Set shared brush to focus on the event time ±30 minutes
    const eventTime = new Date(event.timestamp).getTime();
    const thirtyMinutes = 30 * 60 * 1000;
    
    const selection: BrushSelection = {
      start: new Date(eventTime - thirtyMinutes),
      end: new Date(eventTime + thirtyMinutes),
    };
    
    setSharedBrush(selection);
  };

  const handleKeyDown = (event: React.KeyboardEvent, ruleEvent: RuleEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleChipClick(ruleEvent);
    }
  };

  if (events.length === 0) {
    return (
      <div className="text-muted-foreground text-sm">
        No events detected
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Detected Events ({events.length})</h3>
      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
        {events.map((event) => (
          <button
            key={event.id}
            onClick={(e) => handleChipClick(event, e)}
            onKeyDown={(e) => handleKeyDown(e, event)}
            className={`
              inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border
              transition-all duration-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary
              ${severityColors[event.severity]}
              ${focusedEvent?.id === event.id ? 'ring-2 ring-primary' : ''}
            `}
            aria-label={`${typeLabels[event.type]} event at ${event.site} on ${new Date(event.timestamp).toLocaleString()}`}
          >
            <span className="mr-1">
              {event.type === 'LOW_PF' && '⚡'}
              {event.type === 'VOLTAGE_INSTABILITY' && '📊'}
              {event.type === 'IDLE_PERIOD' && '⏸️'}
            </span>
            <span className="font-medium">{typeLabels[event.type]}</span>
            <span className="ml-1 opacity-75">@{event.site}</span>
            <span className="ml-1 text-xs opacity-60">
              {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </button>
        ))}
      </div>
      
      {focusedEvent && (
        <div className="mt-3 p-3 bg-muted rounded-lg">
          <div className="text-sm">
            <div className="font-medium">{focusedEvent.description}</div>
            <div className="text-muted-foreground mt-1">
              {new Date(focusedEvent.timestamp).toLocaleString()} • {focusedEvent.site}
            </div>
            {focusedEvent.value && focusedEvent.threshold && (
              <div className="text-xs text-muted-foreground mt-1">
                Value: {focusedEvent.value.toFixed(3)} | Threshold: {focusedEvent.threshold.toFixed(3)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}