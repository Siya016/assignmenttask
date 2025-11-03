'use client';

import { useMemo, memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SolarData } from '@/lib/types';
import { useStore } from '@/lib/store';

interface PFHistogramProps {
  data: SolarData[];
}

export const PFHistogram = memo(function PFHistogram({ data }: PFHistogramProps) {
  const { sharedBrush } = useStore();
  
  const filteredData = useMemo(() => {
    if (!sharedBrush) return data;
    return data.filter(d => 
      new Date(d.timestamp) >= sharedBrush.start && new Date(d.timestamp) <= sharedBrush.end
    );
  }, [data, sharedBrush]);

  const histogramData = useMemo(() => {
    const bins = [
      { range: '0.0-0.7', min: 0.0, max: 0.7, count: 0, fill: '#ef4444' },
      { range: '0.7-0.8', min: 0.7, max: 0.8, count: 0, fill: '#f97316' },
      { range: '0.8-0.85', min: 0.8, max: 0.85, count: 0, fill: '#eab308' },
      { range: '0.85-0.9', min: 0.85, max: 0.9, count: 0, fill: '#22c55e' },
      { range: '0.9-1.0', min: 0.9, max: 1.0, count: 0, fill: '#16a34a' },
    ];

    filteredData.forEach(point => {
      const bin = bins.find(b => point.powerFactor >= b.min && point.powerFactor < b.max);
      if (bin) bin.count++;
    });

    return bins;
  }, [filteredData]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No power factor data available
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="range" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: number) => [value, 'Count']}
            labelFormatter={(label: string) => `PF Range: ${label}`}
          />
          <Bar dataKey="count" radius={[2, 2, 0, 0]}>
            {histogramData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});