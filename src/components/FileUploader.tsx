'use client';

import { useCallback, useState } from 'react';
import { useStore } from '@/lib/store';
import { parseXLSXFile } from '@/lib/parseXlsx';
import { runRuleEngine } from '@/lib/ruleEngine';

export function FileUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addFile, addEvents, addLog, files, clearAll } = useStore();

  const processFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      addLog({ level: 'error', message: 'Invalid file type. Please upload XLSX files only.' });
      return;
    }

    setIsProcessing(true);
    try {
      const parsedData = await parseXLSXFile(file);
      addFile(parsedData);
      
      // Run rule engine on the new data
      const events = runRuleEngine(parsedData.data);
      if (events.length > 0) {
        addEvents(events);
      }
    } catch (error) {
      addLog({ 
        level: 'error', 
        message: `Failed to process file: ${error}`,
        data: { filename: file.name }
      });
    } finally {
      setIsProcessing(false);
    }
  }, [addFile, addEvents, addLog]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(processFile);
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(processFile);
  }, [processFile]);



  return (
    <div className="w-full">
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${isProcessing ? 'opacity-50 pointer-events-none' : 'hover:border-primary/50'}
        `}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-4xl">📊</div>
            {files.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs px-2 py-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
              >
                Clear All
              </button>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">Upload Solar Data Files</h3>
            <p className="text-muted-foreground">
              Drag and drop XLSX files here, or click to browse
            </p>
          </div>
          <label className="inline-block">
            <input
              type="file"
              multiple
              accept=".xlsx,.xls"
              onChange={handleFileInput}
              className="sr-only"
              disabled={isProcessing}
              aria-label="Upload XLSX files"
            />
            <span className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 cursor-pointer">
              {isProcessing ? 'Processing...' : 'Browse Files'}
            </span>
          </label>

        </div>
      </div>
    </div>
  );
}