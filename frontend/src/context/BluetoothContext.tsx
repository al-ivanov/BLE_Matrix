import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { BluetoothTerminal } from '@/lib/BluetoothTerminal';
import { terminal } from '@/lib/terminal';

const BluetoothContext = createContext<BluetoothTerminal | null>(null);

export function BluetoothProvider({ children }: { children: ReactNode }) {
	const value = useMemo(() => terminal, []);

	return <BluetoothContext.Provider value={value}>{children}</BluetoothContext.Provider>;
}

export function useBluetooth() {
	const context = useContext(BluetoothContext);

	if (!context) {
		throw new Error('useBluetooth must be used within BluetoothProvider');
	}

	return context;
}
