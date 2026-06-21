import { useState } from 'react';
import { useBluetooth } from '@/context/BluetoothContext';
import { SelectField, type SelectOption } from '@/components/SelectField';

const modeOptions: SelectOption[] = [
	{ value: '2', label: 'Снег' },
	{ value: '3', label: 'Мячик скачет из угла в угол' },
	{ value: '4', label: '3 маленьких шарика скачут' },
	{ value: '5', label: 'Радуга' },
	{ value: '6', label: 'Радуга по диагонали' },
	{ value: '7', label: 'Огонь' },
	{ value: '8', label: 'Матрица' },
	{ value: '9', label: 'Звездопад' },
	{ value: '10', label: 'Огоньки' },
];

const effectOptions: SelectOption[] = [
	{ value: '0', label: 'Без эффекта' },
	{ value: '1', label: 'Дыхание (будет ярче или тусклее от времени)' },
	{ value: '2', label: 'Цвестастый мод' },
	{ value: '3', label: 'Радуга мод' },
];

export function HomePage() {
	const bluetoothTerminal = useBluetooth();
	const [mode, setMode] = useState(modeOptions[0]);
	const [effect, setEffect] = useState(effectOptions[0]);

	async function handleSelectMode(option: SelectOption) {
		setMode(option);
		await bluetoothTerminal.send(`$${option.value}`);
	}

	async function handleSelectEffect(option: SelectOption) {
		setEffect(option);
		await bluetoothTerminal.send('`' + option.value);
	}

	return (
		<section className="flex flex-1 flex-col items-center justify-center">
			<SelectField
				label="Выбери тип режима (вне бегущего текста и эквалайзера)"
				options={modeOptions}
				value={mode}
				onChange={handleSelectMode}
			/>
			<SelectField
				label="Выбери тип эффекта (можно наложить на режим)"
				options={effectOptions}
				value={effect}
				onChange={handleSelectEffect}
			/>
		</section>
	);
}
