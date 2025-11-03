import { create } from 'zustand';
import { AppState, ParsedXLSXData, RuleEvent, LogEntry, BrushSelection } from './types';

export const useStore = create<AppState>()((set, get) => ({
  files: [],
  events: [],
  logs: [],
  brushSelection: null,
  focusedEvent: null,
  modelEnabled: true,
  isLoading: false,
  sharedBrush: null,

  addFile: (file: ParsedXLSXData) => {
    set((state) => ({
      files: [...state.files, file],
    }));
    get().addLog({
      level: 'info',
      message: `File uploaded: ${file.filename}`,
    });
  },

  addEvents: (events: RuleEvent[]) => {
    set((state) => ({
      events: [...state.events, ...events],
    }));
    get().addLog({
      level: 'info',
      message: `Detected ${events.length} rule events`,
    });
  },

  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = {
      ...log,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    set((state) => ({
      logs: [newLog, ...state.logs].slice(0, 5), // Keep only last 5 logs
    }));
  },

  setBrushSelection: (selection: BrushSelection | null) => {
    set({ brushSelection: selection });
  },

  setFocusedEvent: (event: RuleEvent | null) => {
    set({ focusedEvent: event });
  },

  setModelEnabled: (enabled: boolean) => {
    set({ modelEnabled: enabled });
    get().addLog({
      level: 'info',
      message: `Model ${enabled ? 'enabled' : 'disabled'}`,
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setSharedBrush: (selection: BrushSelection | null) => {
    set({ sharedBrush: selection, brushSelection: selection });
  },

  clearAll: () => {
    set({
      files: [],
      events: [],
      logs: [],
      brushSelection: null,
      focusedEvent: null,
      sharedBrush: null,
    });
  },
}));