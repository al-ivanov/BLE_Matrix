import React, { createContext, useContext, useState, useEffect } from 'react';

interface BluetoothState {
  deviceName: string;
  isConnected: boolean;
  config?: any;
}

interface BluetoothContextType extends BluetoothState {
  setDeviceName: (name: string) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined);

export interface BluetoothTerminal {
  connect(): Promise<any>;
  disconnect(): void;
  send(data: string): Promise<void>;
  receive?(data: string): void;
  getDeviceName(): string;
}

interface BluetoothContextData {
  bluetoothTerminal: BluetoothTerminal | null;
  children: React.ReactNode;
}

export function BluetoothProvider({ bluetoothTerminal, children }: BluetoothContextData) {
  const [deviceName, setDeviceNameState] = useState('kepi');
  const [isConnected, setIsConnected] = useState(false);
  const [config, setConfig] = useState<any>(null);

  const setDeviceName = (name: string) => {
    setDeviceNameState(name);
  };

  const connect = async () => {
    if (!bluetoothTerminal) return;
    try {
      await bluetoothTerminal.connect();
      setIsConnected(true);
      await bluetoothTerminal.send('&!');

      if (bluetoothTerminal.receive) {
        bluetoothTerminal.receive = (data: string) => {
          console.log('Bluetooth response:', data);
          const trimmedData = data.trim();
          if (trimmedData.startsWith('$')) {
            const modeNumber = trimmedData.substring(1);
            console.log(`Mode switch requested: ${modeNumber}`);
          } else if (trimmedData.startsWith('@')) {
            const amplitudeValue = parseFloat(trimmedData.substring(1));
            setConfig(prev => ({ ...prev, amplitude: amplitudeValue }));
          } else if (trimmedData === '?') {
            console.log('Button counter requested');
          } else if (trimmedData === '^' || trimmedData.startsWith('^')) {
            const bridgestValue = parseInt(trimmedData.substring(1) || '100');
            setConfig(prev => ({ ...prev, bridgest: bridgestValue }));
          }
        };
      }
    } catch (error) {
      console.error('Bluetooth connection error:', error);
      setIsConnected(false);
    }
  };

  const disconnect = () => {
    if (bluetoothTerminal) {
      bluetoothTerminal.disconnect();
      setIsConnected(false);
    }
  };

  return (
    <BluetoothContext.Provider value={{ deviceName, isConnected, config, setDeviceName, connect, disconnect }}>
      {children}
    </BluetoothContext.Provider>
  );
}

export function useBluetooth() {
  const context = useContext(BluetoothContext);
  if (!context) throw new Error('useBluetooth must be used within BluetoothProvider');
  return context;
}
