import React, { createContext, useContext, useState } from 'react';
import type { BluetoothTerminal } from '../../utils/bluetooth-terminal';

export interface BluetoothState {
  deviceName: string;
}

export interface BluetoothContextType extends BluetoothState {
  setDeviceName: (name: string) => void;
  bluetoothTerminal: BluetoothTerminal | null;
  setBluetoothTerminal: (terminal: BluetoothTerminal | null) => void;
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined);

export function BluetoothProvider({ 
  children,
  bluetoothTerminal 
}: { 
  children: React.ReactNode;
  bluetoothTerminal: BluetoothTerminal | null;
}) {
  const [deviceName, setDeviceName] = useState<string>('kepi');

  return (
    <BluetoothContext.Provider value={{ 
      deviceName, 
      setDeviceName,
      bluetoothTerminal,
      setBluetoothTerminal: (t) => setBluetoothTerminal(t)
    }}>
      {children}
    </BluetoothContext.Provider>
  );
}

export function useBluetooth() {
  const context = useContext(BluetoothContext);
  if (!context) {
    throw new Error('useBluetooth must be used within BluetoothProvider');
  }
  return context;
}
