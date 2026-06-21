import { useEffect, useState } from 'react';
import { useBluetooth } from '@/context/BluetoothContext';
import { useDeviceState } from '@/context/DeviceStateContext';
import { modes } from '@/lib/commonData';
import { SelectField, type SelectOption } from '@/components/SelectField';
import { useSendModeOnConnect } from '@/hooks/useSendModeOnConnect';

const patternOptions: SelectOption[] = [
	{ value: '0', label: 'Радужные Бары' },
	{ value: '1', label: 'Только верха' },
	{ value: '2', label: 'Синии Бары' },
	{ value: '3', label: 'От центра' },
	{ value: '4', label: 'Переливающиеся бары' },
	{ value: '5', label: 'Гераклит' },
];

const amplitudeFactorOptions: SelectOption[] = [
	{ value: '1', label: 'x1' },
	{ value: '2', label: 'x10' },
	{ value: '3', label: 'x100' },
	{ value: '4', label: 'x1000' },
];

const sampleOptions: SelectOption[] = [
	{ value: '1', label: '256' },
	{ value: '2', label: '512' },
	{ value: '3', label: '1024' },
];

const barsCountOptions: SelectOption[] = [
	{ value: '1', label: '8-ми полосный' },
	{ value: '2', label: '16-ти полосный ' },
];

export function EqualizerPage() {
	const bluetoothTerminal = useBluetooth();
	const { amplitude, buttonCounter, autoChangePatterns } = useDeviceState();

	const [pattern, setPattern] = useState(patternOptions[0]);
	const [automode, setAutomode] = useState(false);
	const [eqSensitive, setEqSensitive] = useState(60);
	const [noise, setNoise] = useState(200);
	const [amplitudeFactor, setAmplitudeFactor] = useState(amplitudeFactorOptions[0]);
	const [samples, setSamples] = useState(sampleOptions[0]);
	const [barsCount, setBarsCount] = useState(barsCountOptions[0]);

	useSendModeOnConnect(modes.Eq);

	useEffect(() => {
		setEqSensitive(amplitude);
	}, [amplitude]);

	useEffect(() => {
		const match = patternOptions.find((item) => item.value === buttonCounter.toString());
		if (match) {
			setPattern(match);
		}
	}, [buttonCounter]);

	useEffect(() => {
		setAutomode(autoChangePatterns);
	}, [autoChangePatterns]);

	async function handleSelectPattern(option: SelectOption) {
		setPattern(option);
		await bluetoothTerminal.send(`?${option.value}`);
	}

	async function handleChangeEqSensitive(event: React.ChangeEvent<HTMLInputElement>) {
		const value = Number(event.target.value);
		setEqSensitive(value);
		await bluetoothTerminal.send(`@${value}`);
	}

	async function handleChangeNoise(event: React.ChangeEvent<HTMLInputElement>) {
		const value = Number(event.target.value);
		setNoise(value);
		await bluetoothTerminal.send(`*${value}`);
	}

	async function handleChangeAutoMode(event: React.ChangeEvent<HTMLInputElement>) {
		const checked = event.target.checked;
		setAutomode(checked);
		await bluetoothTerminal.send(`!${checked ? 1 : 0}`);
	}

	async function handleSelectAmplitudeFactor(option: SelectOption) {
		setAmplitudeFactor(option);
		await bluetoothTerminal.send(`aF${option.value}`);
	}

	async function handleSelectSamples(option: SelectOption) {
		setSamples(option);
		await bluetoothTerminal.send(`sA${option.value}`);
	}

	async function handleSelectBarsCount(option: SelectOption) {
		setBarsCount(option);
		await bluetoothTerminal.send(`bB${option.value}`);
	}

	return (
		<section className="mb-3 overflow-auto">
			<SelectField
				label="Выбери тип эквалайзера"
				options={patternOptions}
				value={pattern}
				onChange={handleSelectPattern}
			/>

			<div className="my-2.5 flex flex-col">
				<label htmlFor="automode" className="text-2xl text-slate-50">
					Автоматическое переключение
				</label>
				<input
					type="checkbox"
					id="automode"
					name="automode"
					checked={automode}
					onChange={handleChangeAutoMode}
				/>
			</div>

			<SelectField
				label="Обработка семплов"
				options={sampleOptions}
				value={samples}
				onChange={handleSelectSamples}
			/>

			<SelectField
				label="Количество столбцов"
				options={barsCountOptions}
				value={barsCount}
				onChange={handleSelectBarsCount}
			/>

			<SelectField
				label="Множитель чувствительности"
				options={amplitudeFactorOptions}
				value={amplitudeFactor}
				onChange={handleSelectAmplitudeFactor}
			/>

			<div className="my-2.5 flex flex-col">
				<label htmlFor="noise" className="text-2xl text-slate-50">
					Фильтр шумов
				</label>
				<input
					type="range"
					id="noise"
					name="noise"
					value={noise}
					onChange={handleChangeNoise}
					min={1}
					max={999}
				/>
			</div>

			<div className="my-2.5 flex flex-col">
				<label htmlFor="eqSensitive" className="text-2xl text-slate-50">
					Чувствительность эквалайзера
				</label>
				<input
					type="range"
					id="eqSensitive"
					name="eqSensitive"
					value={eqSensitive}
					onChange={handleChangeEqSensitive}
					min={1}
					max={99}
				/>
			</div>
		</section>
	);
}
