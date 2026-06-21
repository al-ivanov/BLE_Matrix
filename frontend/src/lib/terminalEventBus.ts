export type TerminalEvent =
	| { type: 'data'; data: string; direction: 'in' | 'out' }
	| { type: 'log'; message: string }
	| { type: 'error'; message: string };

type TerminalListener = (event: TerminalEvent) => void;

class TerminalEventBus {
	private listeners = new Set<TerminalListener>();

	subscribe(listener: TerminalListener) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	emit(event: TerminalEvent) {
		this.listeners.forEach((listener) => listener(event));
	}
}

export const terminalEventBus = new TerminalEventBus();
