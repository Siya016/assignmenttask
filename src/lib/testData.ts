import { SolarData } from './types';

export function generateTestData(): SolarData[] {
  const data: SolarData[] = [];
  const sites = ['Site_A', 'Site_B', 'Site_C'];
  const now = new Date();
  
  // Generate 120 data points over 30 hours
  for (let i = 0; i < 120; i++) {
    const timestamp = new Date(now.getTime() - (120 - i) * 15 * 60 * 1000); // 15 min intervals
    const site = sites[i % sites.length];
    
    // Base values
    let powerFactor = 0.9 + Math.random() * 0.08;
    let voltage = 230 + Math.random() * 10 - 5;
    let current = 8 + Math.random() * 5;
    let power = voltage * current * powerFactor;
    let energy = power * 0.25; // 15 min = 0.25 hours
    
    // Rule 1: Low PF violations
    if (i % 10 === 0) {
      powerFactor = 0.5 + Math.random() * 0.3; // 0.5-0.8 range
    }
    
    // Rule 2: Voltage instability - create significant changes
    if (i % 8 === 0 && i > 0) {
      const prevVoltage = data[data.length - 1].voltage;
      voltage = prevVoltage * (0.8 + Math.random() * 0.5); // 20-30% change
    }
    
    // Rule 3: Multiple idle periods
    if ((i >= 20 && i <= 25) || (i >= 40 && i <= 50) || (i >= 80 && i <= 90)) {
      current = 0.1 + Math.random() * 0.2; // Very low current
      voltage = 200 + Math.random() * 50; // But voltage present
      power = voltage * current * powerFactor;
    }
    
    // Recalculate power and energy
    power = voltage * current * powerFactor;
    energy = power * 0.25;
    
    data.push({
      timestamp,
      site,
      powerFactor,
      voltage,
      current,
      power,
      energy,
    });
  }
  
  return data;
}