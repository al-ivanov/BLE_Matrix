import { useEffect, useState, type FormEvent } from 'react';
import { useBluetooth } from '@/context/BluetoothContext';
import { terminalEventBus } from '@/lib/terminalEventBus';

type LogEntry = {
	id: number;
	type: string;
	message: string;
};

let logId = 0;

export function Terminal() {
	const bluetoothTerminal = useBluetooth();
	const [logs, setLogs] = useState<LogEntry[]>([]);
	const [inputValue, setInputValue] = useState('');

	useEffect(() => {
		return terminalEventBus.subscribe((event) => {
			if (event.type === 'data' && event.direction === 'in') {
				setLogs((current) => [
					...current,
					{ id: ++logId, type: 'in', message: event.data },
				]);
			}

			if (event.type === 'log') {
				setLogs((current) => [
					...current,
					{ id: ++logId, type: '', message: event.message },
				]);
			}

			if (event.type === 'error') {
				setLogs((current) => [
					...current,
					{ id: ++logId, type: 'error', message: event.message },
				]);
			}
		});
	}, []);

	function send(data: string) {
		bluetoothTerminal
			.send(data)
			.then(() => {
				terminalEventBus.emit({ type: 'data', data, direction: 'out' });
				setLogs((current) => [
					...current,
					{ id: ++logId, type: 'out', message: data },
				]);
			})
			.catch((error: Error) => {
				terminalEventBus.emit({ type: 'error', message: String(error) });
				setLogs((current) => [
					...current,
					{ id: ++logId, type: 'error', message: String(error) },
				]);
			});
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!inputValue) {
			return;
		}

		send(inputValue);
		setInputValue('');
	}

	return (
		<>
			<div className="flex-grow overflow-auto border-y border-black/10 py-1">
				<ul>
					{logs.map((log) => (
						<li key={log.id}>
							<div className={log.type}>{log.message}</div>
						</li>
					))}
				</ul>
			</div>

			<form id="send-form" className="send-form flex w-full" onSubmit={handleSubmit}>
				<input
					id="input"
					type="text"
					aria-label="Input"
					autoComplete="off"
					placeholder="Type something to send..."
					value={inputValue}
					onChange={(event) => setInputValue(event.target.value)}
					className="flex-1"
				/>

				<button type="submit" aria-label="Send">
					<i className="material-icons">send</i>
				</button>
			</form>
		</>
	);
}
