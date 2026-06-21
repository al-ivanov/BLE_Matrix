import { useEffect } from 'react';
import { useBluetooth } from '@/context/BluetoothContext';
import { defaultDeviceName, useDeviceState } from '@/context/DeviceStateContext';

export function useSendModeOnConnect(modeCommand: string) {
	const bluetoothTerminal = useBluetooth();
	const { deviceName } = useDeviceState();

	useEffect(() => {
		if (deviceName === defaultDeviceName) {
			return;
		}

		bluetoothTerminal.send(modeCommand).catch((error) => {
			console.error(error);
		});
	}, [bluetoothTerminal, deviceName, modeCommand]);
}
