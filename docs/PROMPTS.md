# AI Agent Prompts - Solar Ops Mini-Cockpit

## Google Gemini API Integration

The system uses Google Gemini API (not Vertex AI) with the following prompt structure:

```
You are a solar operations expert analyzing system events. Provide exactly 3 actionable bullet points for the operations team.

Event Summary:
- Total events: {eventCount}
- Sites affected: {siteCount} ({siteList})
- Time range: {startTime} to {endTime}

Event Breakdown:
{eventTypeBreakdown}

Recent Events (last 5):
{recentEventsList}

Provide 3 specific, actionable recommendations starting with bullet points (•). Focus on:
1. Immediate actions for high-severity issues
2. Preventive measures for recurring patterns  
3. Monitoring or investigation steps

Keep each bullet under 100 characters and prioritize operational impact.
```

## Rule-Based Event Context

### Rule #1: Low Power Factor
- **Trigger**: PF < 0.85
- **Severity**: High (<0.7), Medium (<0.8), Low (<0.85)
- **Description**: "Rule #1: PF < 0.85 at {site} ({value})"

### Rule #2: Voltage Instability  
- **Trigger**: >5% voltage change between consecutive readings
- **Severity**: High (>15%), Medium (>10%), Low (>5%)
- **Description**: "Rule #2: Voltage variance {change}V ({percent}%) at {site}"

### Rule #3: Idle Periods
- **Trigger**: Current <0.5A with voltage >100V for 30+ minutes
- **Severity**: High (>60min), Medium (>30min), Low (>15min)
- **Description**: "Rule #3: Idle period {minutes} min at {site}"

## Template Fallback System

When MODEL is OFF or API unavailable, deterministic templates are used:

### High Priority Template
```
⚠️ {count} high-severity events require immediate attention across {sites} site(s)
```

### Rule-Specific Templates
```javascript
// Low Power Factor
`Rule #1: PF < 0.85 detected ${count}x (avg: ${avgPF}) - check capacitor banks`

// Voltage Instability
`Rule #2: Voltage variance up to ${maxChange}V detected - check grid stability`

// Idle Periods
`Rule #3: ${totalIdleTime} min total idle time - verify inverter operation`
```

### Default Fallback
```
No critical issues detected - system operating within normal parameters
Continue monitoring system performance and event patterns
Schedule routine maintenance check for optimal system performance
```

## API Implementation

### Model Configuration
```typescript
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash-latest'
});
```

### Response Processing
```typescript
const bullets = text
  .split('\n')
  .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))
  .map(line => line.replace(/^[•\-]\s*/, '').trim())
  .slice(0, 3);
```

### Error Handling
- **API Failure**: Automatic fallback to templates
- **Timeout**: 30-second timeout with graceful degradation
-

## User Control Features

### MODEL Toggle
- **ON**: Uses Gemini API for intelligent analysis
- **OFF**: Uses deterministic template responses
- **Transparency**: Clear indication of which mode is active

### Abort Functionality
- **Button**: "Abort" appears during analysis
- **Implementation**: AbortController cancels in-flight requests
- **Feedback**: "Analysis aborted" message in response

## Response Quality Guidelines

1. **Rule Citations**: Always reference rule IDs (Rule #1, Rule #2, Rule #3)
2. **Metrics**: Include specific values and thresholds
3. **Site Context**: Mention affected sites by name
