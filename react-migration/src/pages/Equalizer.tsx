import React, { useState } from 'react';
import Select from './components/CustomSelect';

const eqTypes = [
  { value: '0', label: 'Type 1' },
  { value: '1', label: 'Type 2' },
  { value: '2', label: 'Type 3' },
  { value: '3', label: 'Type 4' },
  { value: '4', label: 'Type 5' },
  { value: '5', label: 'Type 6' },
];

const multiplicationFactors = [
  { value: '1', label: 'x1' },
  { value: '2', label: 'x2' },
  { value: '3', label: 'x3' },
  { value: '4', label: 'x4' },
  { value: '5', label: 'x5' },
  { value: '6', label: 'x6' },
  { value: '7', label: 'x7' },
  { value: '8', label: 'x8' },
  { value: '9', label: 'x9' },
  { value: '10', label: 'x10' },
];

interface EqualizerSettings {
  eqType: string;
}

const initialSettings: EqualizerSettings = {
  eqType: '0',
};

export default function Equalizer() {
  const [settings, setSettings] = useState<EqualizerSettings>(initialSettings);

  async function handleSendCommand(event: React.FormEvent) {
    event.preventDefault();

    console.log('Sending equalizer configuration to device:', settings);

    if (bluetoothTerminal && bluetoothTerminal.send) {
      try {
        await bluetoothTerminal.send(`1${settings.eqType}`);

        await bluetoothTerminal.send('!0'); // Auto-change patterns off
      } catch (error) {
        console.error('Error sending command:', error);
      }
    }
  }

  function handleEqTypeChange(event: React.FormEvent<HTMLSelectElement>) {
    event.preventDefault();
    setSettings(prev => ({ ...prev, eqType: event.target.value }));
  }

  return (
    <section className="flex flex-col justify-center items-center flex-1 p-4 bg-gradient-to-b from-cyan-800 to-blue-900">
      <h2 className="text-3xl font-bold text-cyan-300 mb-8 tracking-wider">
        АУДИО ЭКВАЛАЙЗЕР
      </h2>

      <form onSubmit={handleSendCommand} className="w-full max-w-3xl space-y-6">
        <div className="block bg-black/40 rounded-lg p-4 border border-cyan-700">
          <p className="text-cyan-50 text-sm mb-3 font-medium">Тип эквалайзера</p>
          <Select
            options={eqTypes}
            selectedValue={`Type ${Number(settings.eqType) + 1}`}
            onSelect={handleEqTypeChange}
          />
        </div>

        <div className="block bg-black/40 rounded-lg p-4 border border-cyan-700">
          <p className="text-cyan-50 text-sm mb-3 font-medium">Чувствительность</p>
          <input
            type="range"
            min="-30"
            max="10"
            step="1"
            value={parseInt(settings.eqType)}
            onChange={(e) => setSettings(prev => ({ ...prev, eqType: e.target.value }))}
            className="w-full h-2 bg-cyan-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-xs text-cyan-50 mt-1">
            <span>-30 dB</span>
            <span>+10 dB</span>
          </div>
        </div>

        <div className="block bg-black/40 rounded-lg p-4 border border-cyan-700">
          <p className="text-cyan-50 text-sm mb-3 font-medium">Множитель 1 (Группа 1)</p>
          <Select
            options={multiplicationFactors}
            selectedValue={`x${settings.eqType}`}
            onSelect={(e) => setSettings(prev => ({ ...prev, eqType: e.currentTarget.value }))}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-colors shadow-lg shadow-blue-500/30"
        >
          Применить настройки эквалайзера
        </button>
      </form>

      <p className="mt-8 text-cyan-60/60 text-xs text-center">
        Настройте аудиоэквалайзер с 6 типами фильтрации и чувствительностью от -30 до +10 dB
      </p>
    </section>
  );
}
