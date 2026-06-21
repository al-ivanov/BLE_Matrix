import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useBluetooth } from '@/context/BluetoothContext';
import { modes } from '@/lib/commonData';
import { SelectField, type SelectOption } from '@/components/SelectField';
import { useSendModeOnConnect } from '@/hooks/useSendModeOnConnect';

const colorOptions: SelectOption[] = [
	{ value: '0', label: 'Радуга меняющаяся' },
	{ value: '1', label: 'Радуга статичная' },
	{ value: '2', label: 'Royal Blue' },
	{ value: '3', label: 'Яркий розовый' },
	{ value: '4', label: 'Лайм' },
	{ value: '5', label: 'Красный' },
	{ value: '6', label: 'Белый' },
];

export function TextPage() {
	const bluetoothTerminal = useBluetooth();
	const inputRef = useRef<HTMLInputElement>(null);
	const [color, setColor] = useState(colorOptions[0]);
	const [inputValue, setInputValue] = useState('');
	const [textSpeed, setTextSpeed] = useState(70);

	useSendModeOnConnect(modes.Text);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	async function handleSelectColor(option: SelectOption) {
		setColor(option);
		await bluetoothTerminal.send(`?${option.value}`);
	}

	async function handleChangeTextSpeed(event: React.ChangeEvent<HTMLInputElement>) {
		const value = Number(event.target.value);
		setTextSpeed(value);
		await bluetoothTerminal.send(`#${value}`);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!inputValue) {
			return;
		}

		bluetoothTerminal.send(inputValue).catch((error) => {
			console.error(error);
		});
		setInputValue('');
	}

	return (
		<section className="flex h-[calc(100vh-100px)] flex-1 flex-col items-center justify-center">
			<form id="send-form" className="flex w-full flex-col" onSubmit={handleSubmit}>
				<SelectField
					label="Цвет текста"
					options={colorOptions}
					value={color}
					onChange={handleSelectColor}
				/>

				<div className="my-2.5 flex w-full flex-col">
					<label htmlFor="textSpeed" className="text-2xl text-slate-50">
						Скорость текста
					</label>
					<input
						type="range"
						id="textSpeed"
						name="textSpeed"
						value={textSpeed}
						onChange={handleChangeTextSpeed}
						min={35}
						max={255}
					/>
				</div>

				<div className="my-2.5 flex w-full flex-col">
					<input
						ref={inputRef}
						id="input"
						type="text"
						aria-label="Input"
						autoComplete="off"
						placeholder="Текст"
						value={inputValue}
						onChange={(event) => setInputValue(event.target.value)}
						maxLength={40}
						className="flex-1 p-5"
					/>
					<button
						type="submit"
						aria-label="Send"
						className="my-4 flex items-center justify-evenly bg-black/25 px-[20%] py-5"
					>
						<i className="material-icons text-[#817be6]">send</i>
						<span className="text-md font-bold text-white">отправить</span>
					</button>
				</div>
			</form>
		</section>
	);
}
