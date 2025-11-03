# Testing Guide - Solar Ops Mini-Cockpit

## 🚀 **Quick Testing Steps**

### 1. **Start the Application**
```bash
cd solar-mini-cockpit
pnpm install
cp .env.example .env.local
# Add GEMINI_API_KEY to .env.local
pnpm dev
```

### 2. **Test All Features**
1. **Load Test Data**: Click "Load Test Data" button
2. **Verify All Event Types**: Should see chips for:
   - ⚡ **Low PF** (red/orange chips)
   - 📊 **Voltage Instability** (blue chips) 
   - ⏸️ **Idle Period** (gray chips)
3. **Test Brush Linking**: Select range in PF chart → all charts update
4. **Test Event Focus**: Click event chips → brush focuses on event time
5. **Test Navigation**: Go to `/logs` and back → data persists

## 🧪 **Unit Tests**

### Run Unit Tests
```bash
pnpm test
```

**Tests Include:**
- `parseXlsx.test.ts` - XLSX parsing and data joining
- `ruleEngine.test.ts` - All 3 rule detection algorithms
- `store.test.ts` - Zustand state management

### Expected Results
```
✓ parseXlsx › should join datasets correctly
✓ parseXlsx › should handle empty datasets  
✓ parseXlsx › should preserve all data fields
✓ ruleEngine › should detect low power factor events
✓ ruleEngine › should detect voltage instability
✓ ruleEngine › should detect idle periods
✓ ruleEngine › should handle empty data
✓ ruleEngine › should sort events by timestamp descending
✓ store › should add files correctly
✓ store › should add events correctly
✓ store › should toggle model enabled state
✓ store › should clear all data
```

## 🎭 **E2E Tests**

### Run E2E Tests
```bash
# Start dev server in one terminal
pnpm dev

# Run E2E tests in another terminal
pnpm test:e2e
```

**Tests Include:**
- `dashboard.spec.ts` - Dashboard functionality, model toggle, file upload UI
- `logs.spec.ts` - Logs page, filtering, search functionality

### Expected Results
```
✓ Dashboard › should load dashboard page
✓ Dashboard › should navigate to logs page
✓ Dashboard › should show file uploader and triage panel
✓ Dashboard › should toggle model on/off
✓ Dashboard › should show empty state messages
✓ Logs Page › should display logs page correctly
✓ Logs Page › should show log filters
✓ Logs Page › should filter logs by level
✓ Logs Page › should search logs
✓ Logs Page › should clear all data
```

## 🔍 **Self-Check Script**

### Setup Self-Check
```bash
# 1. Create test XLSX files (convert CSV to XLSX)
# You can use Excel or online converters to convert the sample CSV

# 2. Generate checksums
# Windows PowerShell:
cd self-check-input
Get-FileHash *.xlsx -Algorithm SHA256 | ForEach-Object { "$($_.Hash.ToLower()) $($_.Path | Split-Path -Leaf)" } > checksums.txt

# macOS/Linux:
cd self-check-input
shasum -a 256 *.xlsx > checksums.txt
```

### Run Self-Check
```bash
pnpm self-check
```

### Expected Output
```
🔍 Solar Ops Mini-Cockpit Self-Check
=====================================

📋 Found 3 expected files

✅ file1.xlsx - checksum verified
   📊 Parsed 15 records
✅ file2.xlsx - checksum verified  
   📊 Parsed 12 records
✅ file3.xlsx - checksum verified
   📊 Parsed 18 records

🔧 Processing data...
📈 Total records: 45
⚠️  Events detected: 12

📋 DETERMINISTIC ANSWERS:
=========================
{
  "totalRecords": 45,
  "eventsDetected": 12,
  "eventBreakdown": {
    "LOW_PF": 5,
    "VOLTAGE_INSTABILITY": 4,
    "IDLE_PERIOD": 3
  },
  "highSeverityEvents": 2,
  "sitesAffected": 3,
  "avgPowerFactor": 0.823,
  "timeRange": {
    "start": "2024-01-01T10:00:00.000Z",
    "end": "2024-01-01T12:00:00.000Z"
  }
}

✅ Self-check completed successfully
```

## 🐛 **Debugging Tips**

### If Only Low PF Events Show
1. **Check test data generation**:
   ```bash
   # In browser console after clicking "Load Test Data"
   console.log('Events by type:', events.reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc; }, {}));
   ```

2. **Verify rule engine**:
   - Low PF: `powerFactor < 0.85`
   - Voltage: `changePercent > 0.05` (5% change)
   - Idle: `current < 0.5 && voltage > 100` for 30+ minutes

### If Data Disappears on Navigation
- Check browser localStorage for `solar-ops-storage`
- Verify Zustand persist is working
- Check browser console for errors

### If Charts Don't Link
- Verify `sharedBrush` state updates
- Check TimeSeriesChart uses `sharedBrush` not `brushSelection`
- Ensure all charts import `useStore` correctly

### If API Fails
- Check `.env.local` has valid `GEMINI_API_KEY`
- Verify model name is `gemini-1.5-flash-latest`
- Check network tab for API errors
- Template fallback should work even without API key

## 📊 **Performance Testing**

### Check Core Web Vitals
```bash
# Build and analyze
pnpm build
pnpm start

# Use Lighthouse or browser DevTools
# Target metrics:
# - LCP < 2.5s
# - CLS < 0.1  
# - TTI < 3.5s
```

### Bundle Analysis
```bash
# Analyze bundle size
pnpm build --analyze
```

## ✅ **Success Criteria**

- [ ] All unit tests pass
- [ ] All E2E tests pass  
- [ ] Self-check produces deterministic output
- [ ] All 3 rule types generate event chips
- [ ] Brush linking works across all charts
- [ ] Data persists across navigation
- [ ] AI analysis works (with fallback)
- [ ] Performance budgets met
- [ ] Accessibility compliance

Happy testing! 🎉