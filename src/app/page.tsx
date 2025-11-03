'use client';

import { useMemo, Suspense, memo } from 'react';
import { useStore } from '@/lib/store';
import { joinDataSets } from '@/lib/parseXlsx';
import { FileUploader } from '@/components/FileUploader';
import { EventChips } from '@/components/EventChips';
import { TriagePanel } from '@/components/TriagePanel';
import { ClearDataButton } from '@/components/ClearDataButton';
import { TimeSeriesChart } from '@/components/TimeSeriesChart';
import { PFHistogram } from '@/components/PFHistogram';
import { CrossSiteDailyEnergy } from '@/components/CrossSiteDailyEnergy';

const Dashboard = memo(function Dashboard() {
  const { files, events } = useStore();
  
  const allData = useMemo(() => {
    if (files.length === 0) return [];
    return joinDataSets(files);
  }, [files]);

  const hasData = allData.length > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File Upload */}
        <div className="lg:col-span-2">
          <FileUploader />
        </div>
        
        {/* Triage Panel */}
        <div className="space-y-4">
          {hasData && <ClearDataButton />}
          <TriagePanel />
        </div>
      </div>

      {hasData && (
        <>
          {/* Event Chips */}
          <div className="border rounded-lg p-4">
            <EventChips events={events} />
          </div>

          {/* Charts Grid - Only render when data exists */}
          <div className="space-y-6">
            {/* Time Series Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Power Factor Trend</h3>
                <TimeSeriesChart data={allData} metric="powerFactor" />
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Voltage Trend</h3>
                <TimeSeriesChart data={allData} metric="voltage" />
              </div>
            </div>

            {/* Distribution and Energy Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Power Factor Distribution</h3>
                <PFHistogram data={allData} />
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Daily Energy by Site</h3>
                <CrossSiteDailyEnergy data={allData} />
              </div>
            </div>
          </div>

          {/* Data Summary */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Data Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Total Records</div>
                <div className="text-xl font-semibold">{allData.length.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Files Loaded</div>
                <div className="text-xl font-semibold">{files.length}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Events Detected</div>
                <div className="text-xl font-semibold">{events.length}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Sites</div>
                <div className="text-xl font-semibold">
                  {new Set(allData.map(d => d.site)).size}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default function Page() {
  const { setSharedBrush, setFocusedEvent } = useStore();

  const handleBackgroundClick = () => {
    setSharedBrush(null);
    setFocusedEvent(null);
  };

  return (
    <div className="space-y-6" onClick={handleBackgroundClick}>
      <Dashboard />
    </div>
  );
}