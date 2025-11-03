import { AgentResponse, RuleEvent } from './types';

export class AgentClient {
  private abortController: AbortController | null = null;

  async analyzeEvents(
    events: RuleEvent[], 
    modelEnabled: boolean = true
  ): Promise<AgentResponse> {
    // Abort any existing request
    if (this.abortController) {
      this.abortController.abort();
    }

    this.abortController = new AbortController();

    if (!modelEnabled) {
      return this.getTemplateFallback(events);
    }

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Agent API error: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { bullets: ['Analysis aborted'], aborted: true };
      }
      
      console.error('Agent analysis failed:', error);
      return this.getTemplateFallback(events);
    } finally {
      this.abortController = null;
    }
  }

  abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  private getTemplateFallback(events: RuleEvent[]): AgentResponse {
    const bullets: string[] = [];
    
    const eventCounts = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const highSeverityCount = events.filter(e => e.severity === 'high').length;
    const sites = new Set(events.map(e => e.site)).size;

    if (eventCounts.LOW_PF) {
      bullets.push(`${eventCounts.LOW_PF} power factor issues detected - consider capacitor bank adjustments`);
    }

    if (eventCounts.VOLTAGE_INSTABILITY) {
      bullets.push(`${eventCounts.VOLTAGE_INSTABILITY} voltage instabilities found - check grid connection stability`);
    }

    if (eventCounts.IDLE_PERIOD) {
      bullets.push(`${eventCounts.IDLE_PERIOD} idle periods identified - verify inverter operation and weather conditions`);
    }

    if (bullets.length === 0) {
      bullets.push('No significant issues detected in the current dataset');
      bullets.push('System appears to be operating within normal parameters');
      bullets.push('Continue monitoring for any emerging patterns');
    } else if (highSeverityCount > 0) {
      bullets.unshift(`⚠️ ${highSeverityCount} high-severity events require immediate attention across ${sites} site(s)`);
    }

    return { bullets };
  }
}

export const agentClient = new AgentClient();