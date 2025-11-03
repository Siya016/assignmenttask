import { describe, it, expect } from 'vitest';
import { joinDataSets } from '@/lib/parseXlsx';
import { SolarData, ParsedXLSXData } from '@/lib/types';

describe('parseXlsx', () => {
  const mockData1: SolarData[] = [
    {
      timestamp: new Date('2024-01-01T10:00:00Z'),
      site: 'Site_A',
      powerFactor: 0.85,
      voltage: 230,
      current: 10,
      power: 2300,
      energy: 100,
    },
    {
      timestamp: new Date('2024-01-01T11:00:00Z'),
      site: 'Site_A',
      powerFactor: 0.90,
      voltage: 235,
      current: 12,
      power: 2820,
      energy: 120,
    },
  ];

  const mockData2: SolarData[] = [
    {
      timestamp: new Date('2024-01-01T09:00:00Z'),
      site: 'Site_B',
      powerFactor: 0.75,
      voltage: 225,
      current: 8,
      power: 1800,
      energy: 80,
    },
  ];

  const mockDatasets: ParsedXLSXData[] = [
    { data: mockData1, filename: 'test1.xlsx', parseTime: 100 },
    { data: mockData2, filename: 'test2.xlsx', parseTime: 150 },
  ];

  it('should join datasets correctly', () => {
    const result = joinDataSets(mockDatasets);
    
    expect(result).toHaveLength(3);
    expect(result[0].timestamp).toEqual(new Date('2024-01-01T09:00:00Z'));
    expect(result[1].timestamp).toEqual(new Date('2024-01-01T10:00:00Z'));
    expect(result[2].timestamp).toEqual(new Date('2024-01-01T11:00:00Z'));
  });

  it('should handle empty datasets', () => {
    const result = joinDataSets([]);
    expect(result).toHaveLength(0);
  });

  it('should preserve all data fields', () => {
    const result = joinDataSets(mockDatasets);
    
    expect(result[0]).toMatchObject({
      site: 'Site_B',
      powerFactor: 0.75,
      voltage: 225,
      current: 8,
      power: 1800,
      energy: 80,
    });
  });
});