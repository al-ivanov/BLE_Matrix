import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TextMode from './pages/TextMode';
import Equalizer from './pages/Equalizer';
import Terminal from './pages/Terminal';
import About from './pages/About';

export interface AppProps {
  bluetoothTerminal: any;
}

export default function App({ bluetoothTerminal }: AppProps) {
  return (
    <React.StrictMode>
      <div className="flex flex-col h-screen bg-slate-900 text-white">
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/text" element={<TextMode />} />
            <Route path="/equalizer" element={<Equalizer />} />
            <Route path="/terminal" element={<Terminal />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={
              <div className="flex items-center justify-center h-full text-cyan-500">
                Страница не найдена (404)
              </div>
            } />
          </Routes>
        </main>
      </div>
    </React.StrictMode>
  );
}
