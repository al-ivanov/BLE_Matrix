import { Outlet } from 'react-router-dom';
import { BluetoothReceiveBridge } from '@/components/BluetoothReceiveBridge';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { defaultDeviceName, useDeviceDispatch, useDeviceState } from '@/context/DeviceStateContext';
import { useBluetooth } from '@/context/BluetoothContext';
import { isProd } from '@/lib/env';

export function RootLayout() {
	const bluetoothTerminal = useBluetooth();
	const { deviceName, bridgest } = useDeviceState();
	const dispatch = useDeviceDispatch();

	const isDisconnected = deviceName === defaultDeviceName && isProd;

	async function handleChangeBridgest(event: React.ChangeEvent<HTMLInputElement>) {
		const value = Number(event.target.value);
		dispatch({ type: 'SET_BRIDGEST', payload: value });
		await bluetoothTerminal.send(`^${value}`);
	}

	return (
		<>
			<BluetoothReceiveBridge />
			<Header />

			{isDisconnected && (
				<div className="absolute w-full px-0 py-[50%] text-center">
					<span className="text-2xl text-slate-50 [text-shadow:2px_2px_10px_#000000]">
						Нет подключеного устройства
					</span>
				</div>
			)}

			<main
				className={[
					'box-border flex w-screen flex-1 flex-col p-4 pb-[130px] pt-0',
					isDisconnected ? 'pointer-events-none opacity-50' : '',
				].join(' ')}
			>
				<div className="z-[1] my-2.5 flex flex-col [zoom:1.1]">
					<label htmlFor="volume" className="text-2xl text-slate-50">
						Яркость <span className="text-sm text-slate-50">{bridgest}</span>
					</label>
					<input
						type="range"
						id="volume"
						name="volume"
						value={bridgest}
						onChange={handleChangeBridgest}
						min={2}
						max={255}
					/>
				</div>

				<Outlet />
			</main>

			<Footer />
		</>
	);
}
