import React, { useState } from 'react';
import Select from './components/CustomSelect';

interface EffectMode {
  value: string;
  label: string;
}

const modes: EffectMode[] = [
  { value: '0', label: 'Text Mode' },
  { value: '1', label: 'Equalizer' },
  { value: '2', label: 'Snow (Снег)' },
  { value: '3', label: 'Bouncing Ball' },
  { value: '4', label: '3 Bouncing Balls' },
  { value: '5', label: 'Rainbow (Радуга)' },
  { value: '6', label: 'Diagonal Rainbow' },
  { value: '7', label: 'Fire (Огонь)' },
  { value: '8', label: 'Matrix Effect' },
  { value: '9', label: 'Star Shower' },
  { value: '10', label: 'Fireflies' },
];

const overlayEffects = [
  { value: '0', label: 'None' },
  { value: '1', label: 'Breathing' },
  { value: '2', label: 'Color Modulation' },
  { value: '3', label: 'Rainbow Mode' },
];

export default function Home() {
  const [mode, setMode] = useState<EffectMode>(modes[0]);
  const [overlayEffect, setOverlayEffect] = useState<EffectMode>(overlayEffects[0]);
  const [amplitude, setAmplitude] = useState<string>('60');

  async function handleSelectMode(event: React.FormEvent) {
    event.preventDefault();
    console.log(`Switching to mode: ${mode.value}`);

    if (bluetoothTerminal && bluetoothTerminal.send) {
      try {
        await bluetoothTerminal.send(`$${mode.value}`);
      } catch (error) {
        console.error('Error sending command:', error);
      }
    }
  }

  async function handleSelectOverlay(event: React.FormEvent) {
    event.preventDefault();
    console.log(`Switching to overlay effect: ${overlayEffect.value}`);

    if (bluetoothTerminal && bluetoothTerminal.send) {
      try {
        await bluetoothTerminal.send(`\${overlayEffect.value}`);
      } catch (error) {
        console.error('Error sending command:', error);
      }
    }
  }

  async function handleAmplitudeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newAmplitude = event.target.value;
    setAmplitude(newAmplitude);

    if (bluetoothTerminal && bluetoothTerminal.send) {
      try {
        await bluetoothTerminal.send(`@${newAmplitude}`);
      } catch (error) {
        console.error('Error sending amplitude command:', error);
      }
    }
  }

  return (
    <section className="flex flex-col justify-center items-center flex-1 p-4 bg-gradient-to-b from-cyan-900 to-blue-900">
      <h2 className="text-3xl font-bold text-cyan-300 mb-8 tracking-wider">
        ВЫБЕРИТЕ РЕЖИМ
      </h2>

      <div className="w-full max-w-2xl space-y-6">
        <div className="block bg-black/40 rounded-lg p-4 border border-cyan-700">
          <p className="text-cyan-50 text-sm mb-3 font-medium">
            Тип режима (Visual Mode)
          </p>
          <Select
            options={modes.map(m => ({ value: m.value, label: m.label }))}
            selectedValue={mode.label}
            onSelect={handleSelectMode}
            className="text-lg"
          />
        </div>

        <div className="block bg-black/40 rounded-lg p-4 border border-cyan-700">
          <p className="text-cyan-50 text-sm mb-3 font-medium">
            Эффект наложения (Overlay)
          </p>
          <Select
            options={overlayEffects}
            selectedValue={overlayEffect.label}
            onSelect={handleSelectOverlay}
            className="text-lg"
          />
        </div>

        <div className="block bg-black/40 rounded-lg p-4 border border-cyan-700">
          <p className="text-cyan-50 text-sm mb-3 font-medium">
            Яркость эффекта: {amplitude}%
          </p>
          <input
            type="range"
            min="0"
            max="100"
            value={amplitude}
            onChange={handleAmplitudeChange}
            className="w-full h-2 bg-cyan-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-xs text-cyan-50 mt-1">
            <span>Минимум</span>
            <span>Максимум</span>
          </div>
        </div>
      </div>

      <p className="mt-8 text-cyan-60/60 text-xs text-center">
        Выберите визуальный режим и настройте параметры для LED матричного дисплея
      </p>
    </section>
  );
}
