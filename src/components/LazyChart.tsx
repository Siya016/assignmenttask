'use client';

import { Suspense, lazy } from 'react';

const TimeSeriesChart = lazy(() => import('./TimeSeriesChart').then(m => ({ default: m.TimeSeriesChart })));
const PFHistogram = lazy(() => import('./PFHistogram').then(m => ({ default: m.PFHistogram })));
const CrossSiteDailyEnergy = lazy(() => import('./CrossSiteDailyEnergy').then(m => ({ default: m.CrossSiteDailyEnergy })));

function ChartSkeleton() {
  return <div className="w-full h-64 bg-muted animate-pulse rounded" />;
}

export { TimeSeriesChart, PFHistogram, CrossSiteDailyEnergy, ChartSkeleton };