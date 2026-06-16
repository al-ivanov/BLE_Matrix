import React, { useState } from 'react';
import { useBluetooth } from '../context/BluetoothContext';

interface LogEntry {
  type: 'in' | 'out' | 'error';
  message: string;
}

export default function Terminal() {
  const { bluetoothTerminal } = useBluetooth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [inputValue, setInputValue] = useState('');

  function logToTerminal(message: string, type: 'in' | 'out' | 'error' = 'out'): void {
    setLogs(prev => [...prev, { type, message }]);
  }

  async function send(data: string): Promise<void> {
    if (!bluetoothTerminal) return;
    
    bluetoothTerminal.send(data)
      .then(() => logToTerminal(data, 'out'))
      .catch((error: any) => logToTerminal(error.toString(), 'error'));
  }

  function handleReceive(data: string): void {
    if (!bluetoothTerminal) return;
    bluetoothTerminal.receive = (d: string) => {
      console.log('data', d);
      logToTerminal(d, 'in');
    };
    
    console.log('data', data);
    logToTerminal(data, 'in');
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (inputValue && bluetoothTerminal) {
      await send(inputValue);
      setInputValue('');
    }
  }

  return (
    <div className="terminal" style={{
      border: '1px solid rgba(0, 0, 0, 0.12)',
      borderBottomWidth: '1px',
      flexGrow: 1,
      overflow: 'auto',
      padding: '4px 0'
    }}>
      {logs.map((log, index) => (
        <li key={index} className={log.type}>
          {log.message}
        </li>
      ))}
    </div>
  );
}
