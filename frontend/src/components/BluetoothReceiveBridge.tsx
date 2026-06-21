import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBluetooth } from '@/context/BluetoothContext';
import { useDeviceDispatch } from '@/context/DeviceStateContext';
import { parseConfigResponse } from '@/lib/bleProtocol';
import { routes } from '@/lib/commonData';
import { terminalEventBus } from '@/lib/terminalEventBus';

export function BluetoothReceiveBridge() {
	const terminal = useBluetooth();
	const dispatch = useDeviceDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const pathnameRef = useRef(location.pathname);

	useEffect(() => {
		pathnameRef.current = location.pathname;
	}, [location.pathname]);

	useEffect(() => {
		const defaultReceive = (data: string) => {
			console.log('data', data);
		};

		terminal.receive = (data: string) => {
			const parsed = parseConfigResponse(data);

			if (parsed) {
				if (Object.keys(parsed.state).length > 0) {
					dispatch({ type: 'APPLY_PARTIAL', payload: parsed.state });
				}

				if (parsed.route && pathnameRef.current !== `/${routes.terminal}`) {
					navigate(parsed.route);
				}
			}

			terminalEventBus.emit({ type: 'data', data, direction: 'in' });
		};

		terminal._log = (...messages: unknown[]) => {
			messages.forEach((message) => {
				terminalEventBus.emit({ type: 'log', message: String(message) });
				console.log(message);
			});
		};

		return () => {
			terminal.receive = defaultReceive;
			terminal._log = (...messages: unknown[]) => {
				console.log(...messages);
			};
		};
	}, [terminal, dispatch, navigate]);

	return null;
}
