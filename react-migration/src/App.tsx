import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BluetoothProvider, { useBluetooth } from './context/BluetoothContext';
import BluetoothHeader from './components/BluetoothHeader';
import Footer from './components/Footer';
import Home from './pages/Home';
import TextMode from './pages/TextMode';
import Equalizer from './pages/Equalizer';
import Terminal from './pages/Terminal';
import About from './pages/About';

export interface AppProps {
  bluetoothTerminal: any; // Будет инициализирован в main.tsx
}

/**
 * Главный layout компонента приложения
 * Интегрирует BluetoothProvider для управления состоянием соединения
 */
export default function App({ bluetoothTerminal }: AppProps) {
  return (
    <React.StrictMode>
      <BluetoothProvider bluetoothTerminal={bluetoothTerminal}>
        <div className="flex flex-col h-screen bg-slate-900 text-white">
          {/* Шапка с Bluetooth управлением */}
          <BluetoothHeader />

          {/* Основной контент с роутингом */}
          <main className="flex-1 overflow-auto p-4">
            <Routes>
              {/* Главная страница с выбором эффектов */}
              <Route path="/" element={<Home />} />
              
              {/* Текстовый дисплей */}
              <Route path="/text" element={<TextMode />} />
              
              {/* Аудиоэквалайзер */}
              <Route path="/equalizer" element={<Equalizer />} />
              
              {/* Консольный терминал */}
              <Route path="/terminal" element={<Terminal />} />
              
              {/* Статичная информация о проекте */}
              <Route path="/about" element={<About />} />
              
              {/* Catch-all для 404 */}
              <Route path="*" element={
                <div className="flex items-center justify-center h-full text-cyan-500">
                  Страница не найдена (404)
                </div>
              } />
            </Routes>
          </main>

          {/* Футер с навигацией */}
          <Footer />
        </div>
      </BluetoothProvider>
    </React.StrictMode>
  );
}
