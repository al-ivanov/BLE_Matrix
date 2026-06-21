import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';

export const defaultDeviceName = 'kepi';

export type DeviceState = {
	deviceName: string;
	bridgest: number;
	mode: number;
	amplitude: number;
	buttonCounter: number;
	autoChangePatterns: boolean;
};

type DeviceAction =
	| { type: 'SET_DEVICE_NAME'; payload: string }
	| { type: 'SET_BRIDGEST'; payload: number }
	| { type: 'SET_MODE'; payload: number }
	| { type: 'SET_AMPLITUDE'; payload: number }
	| { type: 'SET_BUTTON_COUNTER'; payload: number }
	| { type: 'SET_AUTO_CHANGE_PATTERNS'; payload: boolean }
	| { type: 'APPLY_PARTIAL'; payload: Partial<DeviceState> }
	| { type: 'RESET' };

const initialState: DeviceState = {
	deviceName: defaultDeviceName,
	bridgest: 100,
	mode: 0,
	amplitude: 60,
	buttonCounter: 0,
	autoChangePatterns: false,
};

function deviceReducer(state: DeviceState, action: DeviceAction): DeviceState {
	switch (action.type) {
		case 'SET_DEVICE_NAME':
			return { ...state, deviceName: action.payload };
		case 'SET_BRIDGEST':
			return { ...state, bridgest: action.payload };
		case 'SET_MODE':
			return { ...state, mode: action.payload };
		case 'SET_AMPLITUDE':
			return { ...state, amplitude: action.payload };
		case 'SET_BUTTON_COUNTER':
			return { ...state, buttonCounter: action.payload };
		case 'SET_AUTO_CHANGE_PATTERNS':
			return { ...state, autoChangePatterns: action.payload };
		case 'APPLY_PARTIAL':
			return { ...state, ...action.payload };
		case 'RESET':
			return initialState;
		default:
			return state;
	}
}

const DeviceStateContext = createContext<DeviceState | null>(null);
const DeviceDispatchContext = createContext<Dispatch<DeviceAction> | null>(null);

export function DeviceStateProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(deviceReducer, initialState);

	return (
		<DeviceStateContext.Provider value={state}>
			<DeviceDispatchContext.Provider value={dispatch}>{children}</DeviceDispatchContext.Provider>
		</DeviceStateContext.Provider>
	);
}

export function useDeviceState() {
	const context = useContext(DeviceStateContext);

	if (!context) {
		throw new Error('useDeviceState must be used within DeviceStateProvider');
	}

	return context;
}

export function useDeviceDispatch() {
	const context = useContext(DeviceDispatchContext);

	if (!context) {
		throw new Error('useDeviceDispatch must be used within DeviceStateProvider');
	}

	return context;
}
