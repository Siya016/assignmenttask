# Solar Ops Mini-Cockpit - Product Requirements Document

## Overview
The Solar Ops Mini-Cockpit is a production-ready Next.js dashboard for solar operations teams to monitor system performance, detect anomalies, and receive AI-powered operational recommendations through in-browser XLSX processing.

## Core Features

### Data Ingestion
- **XLSX Upload**: Drag-and-drop interface with flexible column mapping
- **In-Browser Processing**: Client-side parsing using SheetJS for security
- **Multi-Site Support**: Automatic site detection and data joining


### Anomaly Detection (3 Rules)
- **Rule #1 - Low Power Factor**: PF < 0.85 with severity classification (high: <0.7, medium: <0.8, low: <0.85)
- **Rule #2 - Voltage Instability**: >5% voltage change between consecutive readings
- **Rule #3 - Idle Periods**: Current <0.5A with voltage >100V for 30+ minutes
- **Auto-Processing**: Rules execute immediately on data upload

### Interactive Visualization
- **Linked Time-Series**: PF and voltage charts with shared brush selection
- **Power Factor Histogram**: Color-coded distribution (red: critical, green: good)
- **Cross-Site Daily Energy**: Bar chart comparing Wh_sum by site and day
- **Event Chips**: Clickable anomaly indicators that focus charts on problem timeframes

### AI-Powered Triage
- **Google Gemini API**: Direct API integration (not Vertex AI)
- **3-Bullet Format**: Actionable recommendations citing rule IDs and metrics
- **Template Fallback**: Deterministic responses when MODEL OFF or API unavailable


### Operational Monitoring
- **In-App Logs**: Dedicated /logs page with filtering and search
- **Event Tracking**: File uploads, rule detections, AI calls logged 

## Technical Requirements

### Performance Budgets (Achieved)
- **LCP**: 1.72s < 2.5s ✅
- **CLS**: 0.0006 < 0.1 ✅
- **TTI**: Target < 3.5s (optimized with dynamic imports)

### Architecture
- **Framework**: Next.js 14 App Router + TypeScript strict mode
- **Styling**: TailwindCSS + shadcn/ui components
- **Charts**: Visx (time-series) + Recharts (histograms) with lazy loading
- **State**: Zustand with localStorage persistence
- **Testing**: Vitest (unit) + Playwright (E2E)



## User Workflows

### Primary: Upload → Analyze → Act
1. Upload XLSX files (drag-and-drop or browse)
2. View auto-detected events as colored chips
3. Click chips to focus charts on anomaly timeframes
4. Review 3-bullet AI recommendations in triage panel


### Secondary: Monitor → Investigate → Clear
1. Navigate to /logs page for system monitoring
