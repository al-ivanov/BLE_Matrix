import { useBluetooth } from '@/context/BluetoothContext';
import { defaultDeviceName, useDeviceDispatch, useDeviceState } from '@/context/DeviceStateContext';
import { commands } from '@/lib/commonData';

export function Header() {
	const bluetoothTerminal = useBluetooth();
	const { deviceName } = useDeviceState();
	const dispatch = useDeviceDispatch();

	const deviceNameLabel = deviceName || defaultDeviceName;

	async function handleConnect() {
		await bluetoothTerminal.connect();
		dispatch({
			type: 'SET_DEVICE_NAME',
			payload: bluetoothTerminal.getDeviceName() || defaultDeviceName,
		});

		setTimeout(async () => {
			try {
				await bluetoothTerminal.send(commands.GetConfig);
			} catch (error) {
				console.error(error);
			}
		}, 1000);
	}

	function handleDisconnect() {
		bluetoothTerminal.disconnect();
		dispatch({ type: 'SET_DEVICE_NAME', payload: defaultDeviceName });
	}

	return (
		<header className="flex justify-between p-[5px]">
			<div className="corner w-[6em] h-[3em] text-white">{deviceNameLabel}</div>

			<div className="corner w-[6em] h-[3em]">
				<div className="flex justify-around">
					<button type="button" aria-label="Connect" onClick={handleConnect}>
						<i className="material-icons text-[#817be6]">bluetooth_connected</i>
					</button>

					<button type="button" aria-label="Disconnect" onClick={handleDisconnect}>
						<i className="material-icons text-[#817be6]">bluetooth_disabled</i>
					</button>
				</div>
			</div>
		</header>
	);
}
