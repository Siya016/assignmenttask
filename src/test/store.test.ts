import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '@/lib/store';
import { ParsedXLSXData, RuleEvent } from '@/lib/types';

describe('store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useStore.getState().clearAll();
  });

  it('should add files correctly', () => {
    const mockFile: ParsedXLSXData = {
      data: [],
      filename: 'test.xlsx',
      parseTime: 100,
    };

    useStore.getState().addFile(mockFile);
    
    const state = useStore.getState();
    expect(state.files).toHaveLength(1);
    expect(state.files[0]).toEqual(mockFile);
    expect(state.logs).toHaveLength(1);
    expect(state.logs[0].message).toContain('File uploaded: test.xlsx');
  });

  it('should add events correctly', () => {
    const mockEvents: RuleEvent[] = [
      {
        id: 'test-1',
        type: 'LOW_PF',
        severity: 'high',
        timestamp: new Date(),
        site: 'Site_A',
        description: 'Test event',
      },
    ];

    useStore.getState().addEvents(mockEvents);
    
    const state = useStore.getState();
    expect(state.events).toHaveLength(1);
    expect(state.events[0]).toEqual(mockEvents[0]);
    expect(state.logs).toHaveLength(1);
    expect(state.logs[0].message).toContain('Detected 1 rule events');
  });

  it('should toggle model enabled state', () => {
    const { setModelEnabled } = useStore.getState();
    
    expect(useStore.getState().modelEnabled).toBe(true);
    
    setModelEnabled(false);
    expect(useStore.getState().modelEnabled).toBe(false);
    
    setModelEnabled(true);
    expect(useStore.getState().modelEnabled).toBe(true);
  });

  it('should clear all data', () => {
    const mockFile: ParsedXLSXData = {
      data: [],
      filename: 'test.xlsx',
      parseTime: 100,
    };

    const mockEvent: RuleEvent = {
      id: 'test-1',
      type: 'LOW_PF',
      severity: 'high',
      timestamp: new Date(),
      site: 'Site_A',
      description: 'Test event',
    };

    useStore.getState().addFile(mockFile);
    useStore.getState().addEvents([mockEvent]);
    
    expect(useStore.getState().files).toHaveLength(1);
    expect(useStore.getState().events).toHaveLength(1);
    
    useStore.getState().clearAll();
    
    const state = useStore.getState();
    expect(state.files).toHaveLength(0);
    expect(state.events).toHaveLength(0);
    expect(state.brushSelection).toBeNull();
    expect(state.focusedEvent).toBeNull();
  });
});