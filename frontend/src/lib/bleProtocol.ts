import { commands, modes, routes } from '@/lib/commonData';
import type { DeviceState } from '@/context/DeviceStateContext';

export type ConfigParseResult = {
	state: Partial<DeviceState>;
	route: string | null;
};

const configResponsePattern = /^\W=\d+;/;

export function resolveRouteFromMode(fullCommand: string): string | null {
	if (fullCommand === modes.Text) {
		return `/${routes.text}`;
	}

	if (fullCommand === modes.Eq) {
		return `/${routes.equalizer}`;
	}

	return null;
}

export function parseConfigResponse(data: string): ConfigParseResult | null {
	if (!configResponsePattern.test(data)) {
		return null;
	}

	const state: Partial<DeviceState> = {};
	let route: string | null = null;

	for (const paramString of data.split(';')) {
		if (!paramString) {
			continue;
		}

		const [paramName, paramValue] = paramString.split('=');
		const fullCommand = paramName + paramValue;

		switch (paramName) {
			case commands.Bridgest:
				state.bridgest = Number(paramValue);
				break;
			case commands.ChangeMod:
				state.mode = Number(paramValue);
				route = resolveRouteFromMode(fullCommand);
				break;
			case commands.Amplitude:
				state.amplitude = Number(paramValue);
				break;
			case commands.GetButtonCounter:
				state.buttonCounter = Number(paramValue);
				break;
			case commands.AutoChangePatterns:
				state.autoChangePatterns = paramValue === '1';
				break;
		}
	}

	return { state, route };
}
