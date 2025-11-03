import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { RuleEvent, AgentResponse } from '@/lib/types';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash-latest',
});

export async function POST(request: NextRequest) {
  let events: RuleEvent[] = [];
  
  try {
    const body = await request.json();
    events = body.events || [];

    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Invalid events data' },
        { status: 400 }
      );
    }

    // Check if model is available
    if (!process.env.GEMINI_API_KEY) {
      console.warn('Gemini API key not configured, using fallback');
      return NextResponse.json(getFallbackResponse(events));
    }

    const prompt = buildPrompt(events);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response into bullets
    const bullets = text
      .split('\n')
      .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))
      .map(line => line.replace(/^[•\-]\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 3); // Limit to 3 bullets

    if (bullets.length === 0) {
      return NextResponse.json(getFallbackResponse(events));
    }

    const agentResponse: AgentResponse = {
      bullets,
      reasoning: text,
    };

    return NextResponse.json(agentResponse);
  } catch (error) {
    console.error('Agent API error:', error);
    return NextResponse.json(getFallbackResponse(events));
  }
}

function buildPrompt(events: RuleEvent[]): string {
  const eventSummary = events.reduce((acc, event) => {
    const key = `${event.type}_${event.severity}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sites = new Set(events.map(e => e.site));
  const timeRange = events.length > 0 ? {
    start: new Date(Math.min(...events.map(e => new Date(e.timestamp).getTime()))),
    end: new Date(Math.max(...events.map(e => new Date(e.timestamp).getTime()))),
  } : null;

  return `You are a solar operations expert analyzing system events. Provide exactly 3 actionable bullet points for the operations team.

Event Summary:
- Total events: ${events.length}
- Sites affected: ${sites.size} (${Array.from(sites).join(', ')})
- Time range: ${timeRange ? `${timeRange.start.toISOString()} to ${timeRange.end.toISOString()}` : 'N/A'}

Event Breakdown:
${Object.entries(eventSummary).map(([type, count]) => `- ${type}: ${count}`).join('\n')}

Recent Events (last 5):
${events.slice(0, 5).map(e => 
  `- ${e.type} at ${e.site}: ${e.description} (${e.severity} severity)`
).join('\n')}

Provide 3 specific, actionable recommendations starting with bullet points (•). Focus on:
1. Immediate actions for high-severity issues
2. Preventive measures for recurring patterns  
3. Monitoring or investigation steps

Keep each bullet under 100 characters and prioritize operational impact.`;
}

function getFallbackResponse(events: RuleEvent[]): AgentResponse {
  const bullets: string[] = [];
  
  const highSeverityCount = events.filter(e => e.severity === 'high').length;
  const eventsByType = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || []).concat(e);
    return acc;
  }, {} as Record<string, RuleEvent[]>);
  const sites = new Set(events.map(e => e.site));

  if (highSeverityCount > 0) {
    bullets.push(`⚠️ ${highSeverityCount} high-severity events require immediate attention across ${sites.size} site(s)`);
  }

  if (eventsByType.LOW_PF) {
    const lowPfEvents = eventsByType.LOW_PF;
    const avgPF = lowPfEvents.reduce((sum, e) => sum + (e.value || 0), 0) / lowPfEvents.length;
    bullets.push(`Rule #1: PF < 0.85 detected ${lowPfEvents.length}x (avg: ${avgPF.toFixed(3)}) - check capacitor banks`);
  }

  if (eventsByType.VOLTAGE_INSTABILITY) {
    const voltageEvents = eventsByType.VOLTAGE_INSTABILITY;
    const maxChange = Math.max(...voltageEvents.map(e => e.value || 0));
    bullets.push(`Rule #2: Voltage variance up to ${maxChange.toFixed(1)}V detected - check grid stability`);
  }

  if (eventsByType.IDLE_PERIOD) {
    const idleEvents = eventsByType.IDLE_PERIOD;
    const totalIdleTime = idleEvents.reduce((sum, e) => sum + (e.value || 0), 0);
    bullets.push(`Rule #3: ${totalIdleTime.toFixed(0)} min total idle time - verify inverter operation`);
  }

  // Ensure we always have 3 bullets
  while (bullets.length < 3) {
    if (bullets.length === 0) {
      bullets.push('No critical issues detected - system operating within normal parameters');
    } else if (bullets.length === 1) {
      bullets.push('Continue monitoring system performance and event patterns');
    } else {
      bullets.push('Schedule routine maintenance check for optimal system performance');
    }
  }

  return { bullets: bullets.slice(0, 3) };
}