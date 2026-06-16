import React, { useState } from 'react';
import { useBluetooth } from '../context/BluetoothContext';
import type { BluetoothTerminal } from '../utils/bluetooth-terminal';

interface BluetoothHeaderProps {
  bluetoothTerminal: BluetoothTerminal | null;
}

export default function BluetoothHeader({ bluetoothTerminal }: BluetoothHeaderProps) {
  const { deviceName, setDeviceName, bluetoothTerminal: contextTerminal } = useBluetooth();
  const [localTerminal, setLocalTerminal] = useState<BluetoothTerminal | null>(null);
  
  // Merge terminals from context and props
  const terminal = localTerminal || contextTerminal;

  async function handleConnect() {
    if (terminal) {
      await terminal.connect();
      setDeviceName(terminal.getDeviceName() || 'kepi');
      
      // Auto-load configuration after connecting
      setTimeout(async () => {
        try {
          await terminal.send('&!');
        } catch (error) {
          console.error('Failed to load config:', error);
        }
      }, 1000);
    }
  }

  function handleDisconnect() {
    if (terminal) {
      terminal.disconnect();
      setDeviceName('kepi');
    }
  }

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '5px'
    }}>
      <div className="corner text-white">
        {deviceName || 'kepi'}
      </div>
      
      <div className="buttons">
        <button 
          onClick={handleConnect} 
          type="button"
          style={{ 
            background: '#2196F3', 
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer'
          }}
          aria-label="Connect"
        >
          Connect
        </button>

        <button 
          onClick={handleDisconnect} 
          type="button"
          style={{ 
            background: '#f44336', 
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer'
          }}
          aria-label="Disconnect"
        >
          Disconnect
        </button>
      </div>
    </header>
  );
}
