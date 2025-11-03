'use client';

import { useMemo, useCallback, memo } from 'react';
import { Group } from '@visx/group';
import { LinePath } from '@visx/shape';
import { scaleTime, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Brush } from '@visx/brush';
import { Bounds } from '@visx/brush/lib/types';
import { curveMonotoneX } from '@visx/curve';
import { SolarData, BrushSelection } from '@/lib/types';
import { useStore } from '@/lib/store';

interface TimeSeriesChartProps {
  data: SolarData[];
  width?: number;
  height?: number;
  metric: keyof Pick<SolarData, 'powerFactor' | 'voltage' | 'power'>;
}

const margin = { top: 20, right: 20, bottom: 60, left: 60 };

export const TimeSeriesChart = memo(function TimeSeriesChart({ data, width = 600, height = 350, metric }: TimeSeriesChartProps) {
  const { sharedBrush, setSharedBrush } = useStore();
  
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.bottom - margin.top;
  const brushHeight = 50;
  const chartHeight = innerHeight - brushHeight - 20;

  const { xScale, yScale, brushXScale, brushYScale } = useMemo(() => {
    const timeExtent = data.length > 0 ? [
      Math.min(...data.map(d => new Date(d.timestamp).getTime())),
      Math.max(...data.map(d => new Date(d.timestamp).getTime()))
    ] : [Date.now(), Date.now()];

    const valueExtent = data.length > 0 ? [
      Math.min(...data.map(d => d[metric] as number)),
      Math.max(...data.map(d => d[metric] as number))
    ] : [0, 1];

    return {
      xScale: scaleTime({
        range: [0, innerWidth],
        domain: timeExtent,
      }),
      yScale: scaleLinear({
        range: [chartHeight, 0],
        domain: valueExtent,
        nice: true,
      }),
      brushXScale: scaleTime({
        range: [0, innerWidth],
        domain: timeExtent,
      }),
      brushYScale: scaleLinear({
        range: [brushHeight, 0],
        domain: valueExtent,
      }),
    };
  }, [data, metric, innerWidth, chartHeight, brushHeight]);

  const sampledData = useMemo(() => {
    // Sample data to reduce density - take every nth point based on data size
    const sampleRate = Math.max(1, Math.floor(data.length / 500));
    return data.filter((_, index) => index % sampleRate === 0);
  }, [data]);

  const filteredData = useMemo(() => {
    const baseData = sharedBrush ? 
      sampledData.filter(d => 
        new Date(d.timestamp) >= sharedBrush.start && new Date(d.timestamp) <= sharedBrush.end
      ) : sampledData;
    
    // For focused view, use higher resolution
    if (sharedBrush) {
      const focusedSampleRate = Math.max(1, Math.floor(baseData.length / 200));
      return baseData.filter((_, index) => index % focusedSampleRate === 0);
    }
    
    return baseData;
  }, [sampledData, sharedBrush]);

  const handleBrushChange = useCallback((domain: Bounds | null) => {
    if (!domain) {
      setSharedBrush(null);
      return;
    }

    const selection: BrushSelection = {
      start: new Date(brushXScale.invert(domain.x0)),
      end: new Date(brushXScale.invert(domain.x1)),
    };
    setSharedBrush(selection);
  }, [brushXScale, setSharedBrush]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="relative w-full" onClick={(e) => e.stopPropagation()}>
      <svg width={width} height={height} role="img" aria-label={`${metric} time series chart`} className="w-full">
        <Group left={margin.left} top={margin.top}>
          {/* Main Chart */}
          <LinePath
            data={filteredData}
            x={d => xScale(new Date(d.timestamp))}
            y={d => yScale(d[metric] as number)}
            stroke="#1e40af"
            strokeWidth={4}
            curve={curveMonotoneX}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Highlight focused event */}
          {sharedBrush && (
            <rect
              x={xScale(sharedBrush.start)}
              y={0}
              width={xScale(sharedBrush.end) - xScale(sharedBrush.start)}
              height={chartHeight}
              fill="#3b82f6"
              fillOpacity={0.1}
              stroke="#1d4ed8"
              strokeWidth={1}
              strokeDasharray="4 2"
            />
          )}
          
          <AxisBottom
            top={chartHeight}
            scale={xScale}
            numTicks={6}
            tickLabelProps={() => ({
              fill: 'currentColor',
              fontSize: 12,
              textAnchor: 'middle',
            })}
          />
          
          <AxisLeft
            scale={yScale}
            numTicks={5}
            tickLabelProps={() => ({
              fill: 'currentColor',
              fontSize: 12,
              textAnchor: 'end',
              dx: -4,
            })}
          />

          {/* Brush Chart */}
          <Group top={chartHeight + 40}>
            <rect
              width={innerWidth}
              height={brushHeight}
              fill="#f8fafc"
              stroke="#e2e8f0"
              strokeWidth={1}
            />
            <LinePath
              data={sampledData}
              x={d => brushXScale(new Date(d.timestamp))}
              y={d => brushYScale(d[metric] as number)}
              stroke="#374151"
              strokeWidth={3}
              curve={curveMonotoneX}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            <Brush
              xScale={brushXScale}
              yScale={brushYScale}
              width={innerWidth}
              height={brushHeight}
              margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
              handleSize={12}
              resizeTriggerAreas={['left', 'right']}
              brushDirection="horizontal"
              onChange={handleBrushChange}
              extent={sharedBrush ? {
                x0: brushXScale(sharedBrush.start),
                x1: brushXScale(sharedBrush.end),
                y0: 0,
                y1: brushHeight,
              } : undefined}
              selectedBoxStyle={{
                fill: '#3b82f6',
                fillOpacity: 0.2,
                stroke: '#1d4ed8',
                strokeWidth: 2,
              }}
              patternLines={{
                stroke: '#1d4ed8',
                strokeWidth: 1,
                strokeDasharray: '4 2',
              }}
              useWindowMoveEvents
            />
          </Group>
        </Group>
      </svg>
    </div>
  );
});