'use client';

import { useMemo, memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SolarData } from '@/lib/types';
import { useStore } from '@/lib/store';

interface CrossSiteDailyEnergyProps {
  data: SolarData[];
}

export const CrossSiteDailyEnergy = memo(function CrossSiteDailyEnergy({ data }: CrossSiteDailyEnergyProps) {
  const { sharedBrush } = useStore();
  
  const filteredData = useMemo(() => {
    if (!sharedBrush) return data;
    return data.filter(d => 
      new Date(d.timestamp) >= sharedBrush.start && new Date(d.timestamp) <= sharedBrush.end
    );
  }, [data, sharedBrush]);

  const chartData = useMemo(() => {
    interface DailyRecord {
      date: string;
      [site: string]: number | string;
    }

    const dailyData = new Map<string, DailyRecord>();
    
    filteredData.forEach(point => {
      const date = new Date(point.timestamp).toISOString().split('T')[0];
      
      if (!dailyData.has(date)) {
        dailyData.set(date, { date });
      }
      
      const dayData = dailyData.get(date)!;
      // Aggregate energy (Wh_sum) by site & day
      dayData[point.site] = (Number(dayData[point.site]) || 0) + (point.energy || 0);
    });
    
    const result = Array.from(dailyData.values()).sort((a, b) => a.date.localeCompare(b.date));
    return result.length > 0 ? result : [];
  }, [filteredData]);

  const sites = useMemo(() => {
    const siteSet = new Set(data.map(d => d.site));
    return Array.from(siteSet).sort();
  }, [data]);

  const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f97316', '#8b5cf6'];

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No energy data available
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No data in selected time range
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [`${value.toFixed(1)} Wh`, name]}
            labelFormatter={(label: string) => `Date: ${label}`}
          />
          <Legend />
          {sites.map((site, index) => (
            <Bar
              key={site}
              dataKey={site}
              fill={colors[index % colors.length]}
              radius={[2, 2, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
