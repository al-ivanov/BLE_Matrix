import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full px-6 py-2 flex justify-between bg-gradient-to-t from-cyan-900/95 to-transparent fixed bottom-0 z-40 border-t border-cyan-700">
      <Link to="/" className="flex flex-col items-center p-3 cursor-pointer hover:bg-cyan-800/50 rounded transition-colors group">
        <svg className="w-6 h-6 text-cyan-400 mb-1 group-hover:text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className="text-white text-xs font-medium">Главная</span>
      </Link>

      <Link to="/text" className="flex flex-col items-center p-3 cursor-pointer hover:bg-cyan-800/50 rounded transition-colors group">
        <svg className="w-6 h-6 text-cyan-400 mb-1 group-hover:text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        <span className="text-white text-xs font-medium">Бегущая строка</span>
      </Link>

      <Link to="/equalizer" className="flex flex-col items-center p-3 cursor-pointer hover:bg-cyan-800/50 rounded transition-colors group">
        <svg className="w-6 h-6 text-cyan-400 mb-1 group-hover:text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <span className="text-white text-xs font-medium">Эквалайзер</span>
      </Link>

      <Link to="/terminal" className="flex flex-col items-center p-3 cursor-pointer hover:bg-cyan-800/50 rounded transition-colors group">
        <svg className="w-6 h-6 text-cyan-400 mb-1 group-hover:text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        <span className="text-white text-xs font-medium">Terminal</span>
      </Link>
    </footer>
  );
}
