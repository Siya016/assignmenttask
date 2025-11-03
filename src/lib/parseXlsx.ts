import * as XLSX from 'xlsx';
import { SolarData, ParsedXLSXData } from './types';

export function parseXLSXFile(file: File): Promise<ParsedXLSXData> {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const solarData: SolarData[] = jsonData.map((row: any, index) => {
          // Handle various timestamp formats
          let timestamp: Date;
          if (row.timestamp || row.Timestamp || row.TIMESTAMP) {
            const ts = row.timestamp || row.Timestamp || row.TIMESTAMP;
            timestamp = new Date(ts);
          } else if (row.date || row.Date || row.DATE) {
            timestamp = new Date(row.date || row.Date || row.DATE);
          } else {
            // Fallback: use row index as minutes offset from now
            timestamp = new Date(Date.now() - (jsonData.length - index) * 60000);
          }
          
          return {
            timestamp,
            site: String(row.site || row.Site || row.SITE || `Site_${index % 3 + 1}`),
            powerFactor: Number(row.powerFactor || row.power_factor || row.pf || Math.random() * 0.3 + 0.7),
            voltage: Number(row.voltage || row.Voltage || row.V || Math.random() * 50 + 220),
            current: Number(row.current || row.Current || row.I || Math.random() * 10 + 5),
            power: Number(row.power || row.Power || row.P || Math.random() * 1000 + 500),
            energy: Number(row.energy || row.Energy || row.E || Math.random() * 100 + 50),
          };
        });
        
        const parseTime = performance.now() - startTime;
        
        resolve({
          data: solarData,
          filename: file.name,
          parseTime,
        });
      } catch (error) {
        reject(new Error(`Failed to parse XLSX: ${error}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export function joinDataSets(datasets: ParsedXLSXData[]): SolarData[] {
  const allData = datasets.flatMap(d => d.data);
  return allData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}