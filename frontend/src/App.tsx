import { RouterProvider } from 'react-router-dom';
import { BluetoothProvider } from '@/context/BluetoothContext';
import { DeviceStateProvider } from '@/context/DeviceStateContext';
import { router } from '@/routes';

export default function App() {
	return (
		<BluetoothProvider>
			<DeviceStateProvider>
				<RouterProvider router={router} />
			</DeviceStateProvider>
		</BluetoothProvider>
	);
}
