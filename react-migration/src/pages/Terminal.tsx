import React, { useState } from 'react';

interface LogEntry {
  id: string;
  type: 'in' | 'out' | 'error' | 'info';
  timestamp: number;
  message: string;
}

const DEFAULT_LOGS: LogEntry[] = [
  { id: '1', type: 'info', timestamp: Date.now(), message: 'Terminal initialized' },
  { id: '2', type: 'info', timestamp: Date.now() + 100, message: 'Ready to send commands' },
];

export default function Terminal() {
  const [logs, setLogs] = useState<LogEntry[]>(DEFAULT_LOGS);
  const [inputValue, setInputValue] = useState('');

  const getColorForType = (type: LogEntry['type']): string => {
    switch (type) {
      case 'in': return 'text-green-400';
      case 'out': return 'text-blue-400';
      case 'error': return 'text-red-500';
      case 'info': return 'text-cyan-400';
      default: return 'text-white';
    }
  };

  const addLog = (type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev, {
      id: Date.now().toString(),
      type,
      timestamp: Date.now(),
      message,
    }]);
  };

  const handleSendCommand = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!inputValue.trim()) return;

    addLog('out', `> ${inputValue}`);

    try {
      if (bluetoothTerminal && bluetoothTerminal.send) {
        await bluetoothTerminal.send(inputValue);
        addLog('info', `Command sent: ${inputValue}`);
      } else {
        addLog('error', 'Bluetooth не подключен');
      }
    } catch (error) {
      addLog('error', `Ошибка отправки: ${(error as Error).message || String(error)}`);
    }

    setInputValue('');
  };

  return (
    <section className="flex flex-col justify-center items-center flex-1 p-4 bg-black">
      <h2 className="text-3xl font-bold text-cyan-400 mb-4 tracking-wider">TERMINAL</h2>

      <div className="w-full max-w-2xl h-96 bg-black/80 rounded-lg border-2 border-cyan-700 p-4 overflow-y-auto font-mono text-sm shadow-xl">
        {logs.map((log) => (
          <div key={log.id} className={`${getColorForType(log.type)} mb-2 pb-2 border-b last:border-0 ${
            log.type === 'error' ? 'text-red-500 bg-red-900/20' : ''
          }`}>
            <span className="opacity-50 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
            {log.message}
          </div>
        ))}
      </div>

      <form onSubmit={handleSendCommand} className="w-full max-w-2xl mt-4 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Введите команду (например: $0, @60, ^100)"
            className="flex-1 bg-black/60 border-2 border-cyan-700 rounded-lg p-3 text-white placeholder-cyan-600 focus:outline-none focus:border-cyan-400 font-mono"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-lg transition-colors"
          >
            Send
          </button>
        </div>

        <div className="flex items-center gap-2 p-3 bg-black/40 rounded-lg border border-cyan-700">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-green-400 font-medium">Bluetooth не подключен</span>
        </div>

        <div className="bg-black/40 rounded-lg p-3 border border-cyan-700 text-xs space-y-1 max-h-32 overflow-y-auto">
          <p className="text-cyan-60 font-medium mb-2">Подсказки команд:</p>
          <div className="grid grid-cols-2 gap-2">
            <code className="text-cyan-50">$0-$10</code> — выбор режима (0=Text, 1=Eq, 2=Snow и др.)
            <code className="text-cyan-50">@60</code> — яркость 60%
            <code className="text-cyan-50">^100</code> — контраст 100
            <code className="text-cyan-50">&!</code> — запрос конфигурации
            <code className="text-cyan-50">?</code> — статус кнопки
            <code className="text-cyan-50">\0</code> — отключить overlay эффект
          </div>
        </div>
      </form>

      <p className="mt-4 text-cyan-60/60 text-xs text-center">
        Введите команды для устройства в формате ASCII или Uint8Array
      </p>
    </section>
  );
}
