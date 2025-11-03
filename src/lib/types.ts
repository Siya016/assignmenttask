export interface SolarData {
  timestamp: Date;
  site: string;
  powerFactor: number;
  voltage: number;
  current: number;
  power: number;
  energy: number;
}

export interface ParsedXLSXData {
  data: SolarData[];
  filename: string;
  parseTime: number;
}

export interface RuleEvent {
  id: string;
  type: 'LOW_PF' | 'VOLTAGE_INSTABILITY' | 'IDLE_PERIOD';
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  site: string;
  description: string;
  value?: number;
  threshold?: number;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

export interface BrushSelection {
  start: Date;
  end: Date;
}

export interface AgentResponse {
  bullets: string[];
  reasoning?: string;
  aborted?: boolean;
}

export interface AppState {
  files: ParsedXLSXData[];
  events: RuleEvent[];
  logs: LogEntry[];
  brushSelection: BrushSelection | null;
  focusedEvent: RuleEvent | null;
  modelEnabled: boolean;
  isLoading: boolean;
  sharedBrush: BrushSelection | null;
  
  // Actions
  addFile: (file: ParsedXLSXData) => void;
  addEvents: (events: RuleEvent[]) => void;
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  setBrushSelection: (selection: BrushSelection | null) => void;
  setFocusedEvent: (event: RuleEvent | null) => void;
  setModelEnabled: (enabled: boolean) => void;
  setLoading: (loading: boolean) => void;
  setSharedBrush: (selection: BrushSelection | null) => void;
  clearAll: () => void;
}