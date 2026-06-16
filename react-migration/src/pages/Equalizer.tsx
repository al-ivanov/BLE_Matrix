import React, { useState, useEffect } from 'react';
import { useBluetooth } from '../context/BluetoothContext';
import Select from './components/CustomSelect';

const eqTypes = [
  { value: '0', label: 'Радужные Бары' },
  { value: '1', label: 'Только верха' },
  { value: '2', label: 'Синии Бары' },
  { value: '3', label: 'От центра' },
  { value: '4', label: 'Переливающиеся бары' },
  { value: '5', label: 'Гераклит' },
];

const samplesList = [
  { value: '1', label: '256' },
  { value: '2', label: '512' },
  { value: '3', label: '1024' },
];

const barsCount = [
  { value: '1', label: '8-ми полосный' },
  { value: '2', label: '16-ти полосный' },
];

const amplitudeFactors = [
  { value: '1', label: 'x1' },
  { value: '2', label: 'x10' },
  { value: '3', label: 'x100' },
  { value: '4', label: 'x1000' },
];

export default function Equalizer() {
  const { bluetoothTerminal } = useBluetooth();
  const [eqType, setEqType] = useState<string>('0');
  const [automode, setAutomode] = useState(false);
  const [samples, setSamples] = useState('1');
  const [barsCountValue, setBarsCountValue] = useState('1');
  const [amplitudeFactor, setAmplitudeFactor] = useState('1');
  const [noise, setNoise] = useState(60);
  const [eqSensitive, setEqSensitive] = useState(60);

  useEffect(() => {
    if (bluetoothTerminal) {
      bluetoothTerminal.send(`?${eqType}`);
    }
  }, [eqType, bluetoothTerminal]);

  async function handleSelectEqType(event: React.FormEvent) {
    event.preventDefault();
    if (bluetoothTerminal && eqType) {
      await bluetoothTerminal.send(`?${eqType}`);
    }
  }

  async function handleChangeAutoMode(event: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(event.target.checked ? '1' : '0');
    setAutomode(event.target.checked);
    if (bluetoothTerminal) {
      await bluetoothTerminal.send(`!${value}`);
    }
  }

  async function handleChangeEqSensitive(event: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(event.target.value);
    setEqSensitive(value);
    if (bluetoothTerminal) {
      await bluetoothTerminal.send(`@${value}`);
    }
  }

  async function handleChangeNoise(event: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(event.target.value);
    setNoise(value);
    if (bluetoothTerminal) {
      await bluetoothTerminal.send(`*${value}`);
    }
  }

  async function handleSelectSamples(event: React.FormEvent) {
    event.preventDefault();
    if (bluetoothTerminal && samples) {
      await bluetoothTerminal.send(`sA${samples}`);
    }
  }

  async function handleSelectBarsCount(event: React.FormEvent) {
    event.preventDefault();
    if (bluetoothTerminal && barsCountValue) {
      await bluetoothTerminal.send(`bB${barsCountValue}`);
    }
  }

  async function handleSelectAmplitudeFactor(event: React.FormEvent) {
    event.preventDefault();
    if (bluetoothTerminal && amplitudeFactor) {
      await bluetoothTerminal.send(`aF${amplitudeFactor}`);
    }
  }

  return (
    <section className="overflow-auto mb-3">
      <div className="block w-full">
        <p className="w-full block text-cyan-50">Тип эквалайзера</p>
        <Select
          options={eqTypes}
          selectedValue={eqType}
          onSelect={handleSelectEqType}
        />
      </div>

      <div className="block w-full">
        <label>
          Автоматическое переключение
        </label>
        <input
          type="checkbox"
          checked={automode}
          onChange={handleChangeAutoMode}
        />
      </div>

      <div className="block w-full">
        <p className="w-full block text-cyan-50">Обработка семплов</p>
        <Select
          options={samplesList}
          selectedValue={samples}
          onSelect={handleSelectSamples}
        />
      </div>

      <div className="block w-full">
        <p className="w-full block text-cyan-50">Количество столбцов</p>
        <Select
          options={barsCount}
          selectedValue={barsCountValue}
          onSelect={handleSelectBarsCount}
        />
      </div>

      <div className="block w-full">
        <p className="w-full block text-cyan-50">Множитель чувствительности</p>
        <Select
          options={amplitudeFactors}
          selectedValue={amplitudeFactor}
          onSelect={handleSelectAmplitudeFactor}
        />
      </div>

      <div className="block w-full">
        <p className="w-full block text-cyan-50">Фильтр шумов</p>
        <input
          type="range"
          min="1"
          max="999"
          value={noise}
          onChange={handleChangeNoise}
        />
      </div>

      <div className="block w-full">
        <p className="w-full block text-cyan-50">Чувствительность эквалайзера</p>
        <input
          type="range"
          min="1"
          max="99"
          value={eqSensitive}
          onChange={handleChangeEqSensitive}
        />
      </div>
    </section>
  );
}
