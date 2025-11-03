# System Orchestration - Solar Ops Mini-Cockpit

## Data Flow Architecture

```
[XLSX Files] → [FileUploader] → [parseXLSX] → [Zustand Store]
                                      ↓
[Rule Engine] ← [joinDataSets] ← [ParsedData]
      ↓
[RuleEvents] → [Zustand Store] → [EventChips] → [SharedBrush]
                     ↓                              ↓
[TriagePanel] ← [AgentClient] ← [Events]    [All Charts]
      ↓              ↓
[AI Analysis] → [/api/agent] → [Gemini API / Template Fallback]
```

## Component Interaction Flow

### 1. File Upload → Analysis Process
```
User drops XLSX → FileUploader validates → parseXLSXFile() executes
→ Data stored in Zustand (persisted) → Rule engine runs (3 rules)
→ Events generated with rule IDs → Charts render + Event chips appear
```

### 2. Event Investigation → Chart Focus
```
User clicks EventChip → setFocusedEvent() → setSharedBrush(±30min)
→ All charts update simultaneously → Brush highlights problem timeframe
→ User can adjust brush → All charts re-filter data in sync
```

### 3. AI Analysis → Recommendations
```
Events auto-trigger analysis → AgentClient checks MODEL toggle
→ If ON: /api/agent → Gemini API → 3 bullets with rule citations
→ If OFF: Template fallback → Deterministic rule-based bullets
→ UI displays recommendations → All actions logged
```

## State Management (Zustand + Persistence)

### Store Structure
```typescript
{
  files: ParsedXLSXData[],        // Persisted: uploaded files
  events: RuleEvent[],            // Persisted: detected anomalies  
  logs: LogEntry[],               // Not persisted: session logs
  sharedBrush: BrushSelection,    // Shared across all charts
  focusedEvent: RuleEvent,        // Currently selected event
  modelEnabled: boolean,          // Persisted: AI toggle state
  isLoading: boolean              // Loading indicators
}
```

### Persistence Strategy
- **localStorage**: Files, events, modelEnabled persist across sessions
- **Session Only**: Logs, brush state, loading states reset on refresh
- **Quota Management**: Custom storage handler prevents quota exceeded errors
- **Clean State**: Empty dashboard until files uploaded

## Performance Optimizations (Achieved)

### Bundle Strategy
```
Core Bundle: Next.js + React + Zustand + UI (~200KB)
Chart Bundle: Visx + Recharts (dynamic import, ~150KB)
Vendor Bundle: node_modules dependencies
```

### Rendering Optimizations
- **React.memo**: All chart components memoized
- **Dynamic Imports**: Charts load only when data exists
- **Data Limiting**: Max 500 points per chart for performance
- **Conditional Rendering**: Charts only render when hasData = true

### Memory Management
- **Log Rotation**: Keep only last 50 entries (reduced from 1000)
- **Storage Cleanup**: Auto-clear on quota exceeded
- **Chart Optimization**: Efficient timestamp handling
- **Abort Controllers**: Cancel in-flight Gemini requests

## Error Handling → Graceful Degradation

### Client-Side Recovery
```
XLSX Parse Error → User notification → Continue with other files
Chart Render Error → "No data available" fallback
Timestamp Error → Auto-convert to Date objects
Storage Quota → Clear storage → Fresh start
```

### API Error Handling
```
Gemini API Error → Template fallback → Continue analysis
Network Timeout → Abort request → Show "Analysis failed" → Retry available
API Key Missing → Template mode only → Log warning
```

### User Experience
- **No Broken States**: Always show something useful
- **Clear Feedback**: Loading states, error messages, success indicators
- **Recovery Options**: Clear data, retry analysis, toggle model
- **Persistent Data**: Work survives page navigation

## Security → Client-First Architecture

### Data Protection
- **In-Browser Processing**: XLSX parsing never leaves client
- **No Server Storage**: Files processed and discarded immediately
- **API Key Security**: Gemini key server-side only in /api/agent
- **CORS Protection**: API routes restricted to same origin

### Performance Security
- **File Size Limits**: Prevent memory exhaustion
- **Data Point Limits**: Cap chart data for performance
- **Request Timeouts**: Prevent hanging API calls
- **Storage Quotas**: Graceful handling of localStorage limits

## Testing → Quality Assurance

### Unit Tests (Vitest)
- **parseXlsx**: Data joining, timestamp handling
- **ruleEngine**: All 3 rules, severity classification
- **store**: State management, persistence

### E2E Tests (Playwright)
- **dashboard**: File upload, model toggle, empty states
- **logs**: Page navigation, filtering, search

### Performance Tests
- **Lighthouse**: LCP 1.72s, CLS 0.0006, TTI optimized
- **Self-Check**: Automated validation with deterministic output