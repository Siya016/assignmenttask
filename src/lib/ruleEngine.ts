import { SolarData, RuleEvent } from './types';

export function runRuleEngine(data: SolarData[]): RuleEvent[] {
  const events: RuleEvent[] = [];
  
  // Rule 1: Low Power Factor Detection
  data.forEach((point, index) => {
    if (point.powerFactor < 0.85) {
      events.push({
        id: `R1-${crypto.randomUUID().slice(0, 8)}`,
        type: 'LOW_PF',
        severity: point.powerFactor < 0.7 ? 'high' : point.powerFactor < 0.8 ? 'medium' : 'low',
        timestamp: point.timestamp,
        site: point.site,
        description: `Rule #1: PF < 0.85 at ${point.site} (${point.powerFactor.toFixed(3)})`,
        value: point.powerFactor,
        threshold: 0.85,
      });
    }
  });

  // Rule 2: Voltage Instability Detection
  for (let i = 1; i < data.length; i++) {
    const current = data[i];
    const previous = data[i - 1];
    
    if (current.site === previous.site) {
      const voltageChange = Math.abs(current.voltage - previous.voltage);
      const changePercent = voltageChange / previous.voltage;
      
      if (changePercent > 0.05) { // 5% change threshold
        events.push({
          id: `R2-${crypto.randomUUID().slice(0, 8)}`,
          type: 'VOLTAGE_INSTABILITY',
          severity: changePercent > 0.15 ? 'high' : changePercent > 0.1 ? 'medium' : 'low',
          timestamp: current.timestamp,
          site: current.site,
          description: `Rule #2: Voltage variance ${voltageChange.toFixed(1)}V (${(changePercent * 100).toFixed(1)}%) at ${current.site}`,
          value: voltageChange,
          threshold: previous.voltage * 0.05,
        });
      }
    }
  }

  // Rule 3: Idle Period Detection (near-zero current but non-zero voltage)
  const siteGroups = groupBySite(data);
  
  Object.entries(siteGroups).forEach(([site, siteData]) => {
    let idleStart: Date | null = null;
    let idleCount = 0;
    
    siteData.forEach((point, index) => {
      const isIdle = point.current < 0.5 && point.voltage > 100; // Near-zero current but voltage present
      
      if (isIdle) {
        if (!idleStart) {
          idleStart = point.timestamp;
        }
        idleCount++;
      } else {
        if (idleStart && idleCount >= 2) { // At least 2 consecutive idle points (30 minutes)
          const idleDuration = point.timestamp.getTime() - idleStart.getTime();
          const idleMinutes = idleDuration / (1000 * 60);
          
          events.push({
            id: `R3-${crypto.randomUUID().slice(0, 8)}`,
            type: 'IDLE_PERIOD',
            severity: idleMinutes > 60 ? 'high' : idleMinutes > 30 ? 'medium' : 'low',
            timestamp: idleStart,
            site,
            description: `Rule #3: Idle period ${idleMinutes.toFixed(0)} min at ${site}`,
            value: idleMinutes,
            threshold: 15,
          });
        }
        idleStart = null;
        idleCount = 0;
      }
    });
    
    // Handle case where idle period extends to end of data
    if (idleStart && idleCount >= 2) {
      const lastPoint = siteData[siteData.length - 1];
      const endTime = lastPoint ? new Date(lastPoint.timestamp).getTime() : (idleStart as Date).getTime();
      const idleDuration = endTime - (idleStart as Date).getTime();
      const idleMinutes = idleDuration / (1000 * 60);
      
      events.push({
        id: `R3-${crypto.randomUUID().slice(0, 8)}`,
        type: 'IDLE_PERIOD',
        severity: idleMinutes > 60 ? 'high' : idleMinutes > 30 ? 'medium' : 'low',
        timestamp: idleStart as Date,
        site,
        description: `Rule #3: Idle period ${idleMinutes.toFixed(0)} min at ${site}`,
        value: idleMinutes,
        threshold: 15,
      });
    }
  });

  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

function groupBySite(data: SolarData[]): Record<string, SolarData[]> {
  return data.reduce((groups, point) => {
    if (!groups[point.site]) {
      groups[point.site] = [];
    }
    groups[point.site].push(point);
    return groups;
  }, {} as Record<string, SolarData[]>);
}
