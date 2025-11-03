import { describe, it, expect } from 'vitest';
import { runRuleEngine } from '@/lib/ruleEngine';
import { SolarData } from '@/lib/types';

describe('ruleEngine', () => {
  const baseData: SolarData = {
    timestamp: new Date('2024-01-01T10:00:00Z'),
    site: 'Site_A',
    powerFactor: 0.95,
    voltage: 230,
    current: 10,
    power: 2300,
    energy: 100,
  };

  it('should detect low power factor events', () => {
    const data: SolarData[] = [
      { ...baseData, powerFactor: 0.6 }, // Should trigger high severity
      { ...baseData, powerFactor: 0.75, timestamp: new Date('2024-01-01T11:00:00Z') }, // Should trigger medium severity
      { ...baseData, powerFactor: 0.82, timestamp: new Date('2024-01-01T12:00:00Z') }, // Should trigger low severity
    ];

    const events = runRuleEngine(data);
    const lowPfEvents = events.filter(e => e.type === 'LOW_PF');
    
    expect(lowPfEvents).toHaveLength(3);
    // Events are sorted by timestamp descending, so check in reverse order
    expect(lowPfEvents[2].severity).toBe('high'); // 0.6 PF
    expect(lowPfEvents[1].severity).toBe('medium'); // 0.75 PF
    expect(lowPfEvents[0].severity).toBe('low'); // 0.82 PF
  });

  it('should detect voltage instability', () => {
    const data: SolarData[] = [
      { ...baseData, voltage: 230 },
      { ...baseData, voltage: 250, timestamp: new Date('2024-01-01T11:00:00Z') }, // 20V change = 8.7%
    ];

    const events = runRuleEngine(data);
    const voltageEvents = events.filter(e => e.type === 'VOLTAGE_INSTABILITY');
    
    expect(voltageEvents).toHaveLength(1);
    expect(voltageEvents[0].severity).toBe('low');
    expect(voltageEvents[0].value).toBeCloseTo(20, 1);
  });

  it('should detect idle periods', () => {
    const data: SolarData[] = [
      { ...baseData, current: 0.2, voltage: 220, timestamp: new Date('2024-01-01T10:00:00Z') }, // Start idle
      { ...baseData, current: 0.1, voltage: 230, timestamp: new Date('2024-01-01T10:30:00Z') }, // Still idle
      { ...baseData, current: 0.3, voltage: 225, timestamp: new Date('2024-01-01T11:00:00Z') }, // Still idle
      { ...baseData, current: 8, voltage: 230, timestamp: new Date('2024-01-01T11:30:00Z') }, // End idle
    ];

    const events = runRuleEngine(data);
    const idleEvents = events.filter(e => e.type === 'IDLE_PERIOD');
    
    expect(idleEvents).toHaveLength(1);
    expect(idleEvents[0].value).toBeCloseTo(90, 0); // 90 minutes
  });

  it('should handle empty data', () => {
    const events = runRuleEngine([]);
    expect(events).toHaveLength(0);
  });

  it('should sort events by timestamp descending', () => {
    const data: SolarData[] = [
      { ...baseData, powerFactor: 0.6, timestamp: new Date('2024-01-01T10:00:00Z') },
      { ...baseData, powerFactor: 0.6, timestamp: new Date('2024-01-01T12:00:00Z') },
      { ...baseData, powerFactor: 0.6, timestamp: new Date('2024-01-01T11:00:00Z') },
    ];

    const events = runRuleEngine(data);
    
    expect(events[0].timestamp.getTime()).toBeGreaterThan(events[1].timestamp.getTime());
    expect(events[1].timestamp.getTime()).toBeGreaterThan(events[2].timestamp.getTime());
  });
});