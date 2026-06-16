import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TextMode from './pages/TextMode';
import Equalizer from './pages/Equalizer';
import Terminal from './pages/Terminal';
import About from './pages/About';

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen">
        <header className="p-2 text-white">
          {/* Bluetooth Header component would go here */}
          <div className="text-xs">Connected: kepi</div>
        </header>
        
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/text" element={<TextMode />} />
            <Route path="/equalizer" element={<Equalizer />} />
            <Route path="/terminal" element={<Terminal />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        
        <footer className="p-2 text-slate-50">
          {/* Footer component would go here */}
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
