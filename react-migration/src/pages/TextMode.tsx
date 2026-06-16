import React, { useState } from 'react';
import { useBluetooth } from '../context/BluetoothContext';
import Select from './components/CustomSelect';

const textColors = [
  { value: '0', label: 'Радуга меняющаяся' },
  { value: '1', label: 'Радуга статичная' },
  { value: '2', label: 'Royal Blue' },
  { value: '3', label: 'Яркий розовый' },
  { value: '4', label: 'Лайм' },
  { value: '5', label: 'Красный' },
  { value: '6', label: 'Белый' },
];

export default function TextMode() {
  const { bluetoothTerminal } = useBluetooth();
  const [textColor, setTextColor] = useState<string>(textColors[0].value);
  const [textSpeed, setTextSpeed] = useState<number>(70);
  const [inputValue, setInputValue] = useState('');

  async function handleSelectColor(event: React.FormEvent) {
    event.preventDefault();
    if (bluetoothTerminal && textColor) {
      await bluetoothTerminal.send(`?${textColor}`);
    }
  }

  async function handleChangeTextSpeed(event: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(event.target.value);
    setTextSpeed(value);
    if (bluetoothTerminal) {
      await bluetoothTerminal.send(`#${value}`);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (inputValue && bluetoothTerminal) {
      await bluetoothTerminal.send(inputValue);
      setInputValue('');
    }
  }

  return (
    <section className="flex flex-col justify-center items-center flex-1 h-[calc(100vh-100px)]">
      <form className="send-form" onSubmit={handleSubmit}>
        <div className="block w-full">
          <p className="w-full block text-cyan-50">Цвет текста</p>
          <Select
            options={textColors.map(c => ({ value: c.value, label: c.label }))}
            selectedValue={textColor}
            onSelect={handleSelectColor}
          />
        </div>
        
        <div className="block w-full">
          <p className="w-full block text-cyan-50">Скорость текста</p>
          <input
            type="range"
            min="35"
            max="255"
            value={textSpeed}
            onChange={handleChangeTextSpeed}
          />
        </div>
        
        <div className="block w-full">
          <input
            type="text"
            placeholder="Текст"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            maxLength={40}
          />
          <button type="submit">
            Send
          </button>
        </div>
      </form>
    </section>
  );
}
