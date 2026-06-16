import React, { useState } from 'react';
import { useBluetooth } from '../context/BluetoothContext';
import Select from './components/CustomSelect';

export interface EffectMode {
  value: string;
  label: string;
}

const modes: EffectMode[] = [
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

const effects = [
  { value: '0', label: 'Без эффекта' },
  { value: '1', label: 'Дыхание (будет ярче или тусклее от времени)' },
  { value: '2', label: 'Цвестастый мод' },
  { value: '3', label: 'Радуга мод' },
];

export default function Home() {
  const { bluetoothTerminal } = useBluetooth();
  const [mode, setMode] = useState<EffectMode>(modes[0]);
  const [effect, setEffect] = useState<EffectMode>(effects[0]);

  async function handleSelectMode(event: React.FormEvent) {
    event.preventDefault();
    if (bluetoothTerminal && mode.value) {
      await bluetoothTerminal.send(`$${mode.value}`);
    }
  }

  async function handleSelectEffect(event: React.FormEvent) {
    event.preventDefault();
    if (bluetoothTerminal && effect.value) {
      await bluetoothTerminal.send(`\`${effect.value}`);
    }
  }

  return (
    <section className="flex flex-col justify-center items-center flex-1">
      <div className="block w-full">
        <p className="w-full block text-cyan-50">Выбери тип режима</p>
        <Select
          options={modes}
          selectedValue={mode.label}
          onSelect={handleSelectMode}
        />
      </div>
      
      <div className="block w-full">
        <p className="w-full block text-cyan-50">Выбери тип эффекта</p>
        <Select
          options={effects}
          selectedValue={effect.label}
          onSelect={handleSelectEffect}
        />
      </div>
    </section>
  );
}
