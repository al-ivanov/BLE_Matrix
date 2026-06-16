import React, { useState } from 'react';

interface TextSettings {
  text: string;
  speed: number;
  fontSize: number;
  textColor: string;
  blinkInterval: number;
}

const initialSettings: TextSettings = {
  text: '',
  speed: 50,
  fontSize: 20,
  textColor: '#ffffff',
  blinkInterval: 0,
};

const colors = [
  { value: '#000000', label: 'Black' },
  { value: '#FFFFFF', label: 'White' },
  { value: '#FF0000', label: 'Red' },
  { value: '#00FF00', label: 'Green' },
  { value: '#0000FF', label: 'Blue' },
  { value: '#FFFF00', label: 'Yellow' },
  { value: '#FF00FF', label: 'Magenta' },
  { value: '#00FFFF', label: 'Cyan' },
];

export default function TextMode() {
  const [settings, setSettings] = useState<TextSettings>(initialSettings);

  async function handleSendCommand(event: React.FormEvent) {
    event.preventDefault();

    if (bluetoothTerminal && bluetoothTerminal.send) {
      try {
        await bluetoothTerminal.send(`0${settings.text.padEnd(15, ' ')}`.substring(0, 23).split('').map(c => c.charCodeAt(0)).join(''));
      } catch (error) {
        console.error('Error sending command:', error);
      }
    }
  }

  function handleSpeedChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSettings(prev => ({ ...prev, speed: parseInt(event.target.value) || 0 }));
  }

  function handleFontSizeChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSettings(prev => ({ ...prev, fontSize: parseInt(event.target.value) || 15 }));
  }

  function handleBlinkIntervalChange(event: React.ChangeEvent<HTMLInputElement>) {
    const interval = parseInt(event.target.value) || 0;
    setSettings(prev => ({ ...prev, blinkInterval: interval }));
  }

  function handleColorChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSettings(prev => ({ ...prev, textColor: event.target.value }));
  }

  return (
    <section className="flex flex-col justify-center items-center flex-1 p-4 bg-gradient-to-b from-blue-900 to-cyan-900">
      <h2 className="text-3xl font-bold text-cyan-300 mb-8 tracking-wider">
        РЕЖИМ ТЕКСТОВОГО ДИСПЛЕЯ
      </h2>

      <form onSubmit={handleSendCommand} className="w-full max-w-2xl space-y-6">
        <div className="block bg-black/40 rounded-lg p-4 border border-cyan-700">
          <p className="text-cyan-50 text-sm mb-3 font-medium">Текст дисплея</p>
          <textarea
            value={settings.text}
            onChange={(e) => setSettings(prev => ({ ...prev, text: e.target.value }))}
            maxLength={16}
            className="w-full bg-black/60 border border-cyan-600 rounded-lg p-3 text-white placeholder-cyan-500 focus:outline-none focus:border-cyan-400 resize-none"
            rows={3}
            placeholder="Введите текст (макс 16 символов)"
          />
        </div>

        <div className="block bg-black/40 rounded-lg p-4 border border-cyan-700">
          <p className="text-cyan-50 text-sm mb-3 font-medium">Цвет текста</p>
          <input
            type="color"
            value={settings.textColor}
            onChange={handleColorChange}
            className="w-full h-12 rounded-lg cursor-pointer border border-cyan-600 bg-black/60"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, textColor: color.value }))}
                style={{ backgroundColor: color.value }}
                className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-transform ${
                  settings.textColor === color.value ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="block bg-black/40 rounded-lg p-4 border border-cyan-700">
          <p className="text-cyan-50 text-sm mb-3 font-medium">Скорость текста: {settings.speed}%</p>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.speed}
            onChange={handleSpeedChange}
            className="w-full h-2 bg-cyan-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        <div className="block bg-black/40 rounded-lg p-4 border border-cyan-700">
          <p className="text-cyan-50 text-sm mb-3 font-medium">Размер шрифта: {settings.fontSize}</p>
          <input
            type="range"
            min="10"
            max="50"
            value={settings.fontSize}
            onChange={handleFontSizeChange}
            className="w-full h-2 bg-cyan-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        <div className="block bg-black/40 rounded-lg p-4 border border-cyan-700">
          <p className="text-cyan-50 text-sm mb-3 font-medium">Интервал мигания: {settings.blinkInterval}ms</p>
          <input
            type="range"
            min="0"
            max="1000"
            value={settings.blinkInterval}
            onChange={handleBlinkIntervalChange}
            className="w-full h-2 bg-cyan-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-colors shadow-lg shadow-blue-500/30"
        >
          Отправить команду устройству
        </button>
      </form>

      <p className="mt-8 text-cyan-60/60 text-xs text-center">
        Настройте текст, цвет и параметры отображения для LED матричного дисплея
      </p>
    </section>
  );
}
