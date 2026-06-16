export default function About() {
  return (
    <section className="flex items-center justify-center flex-1 p-8 bg-gradient-to-b from-slate-900 to-cyan-900">
      <div className="max-w-2xl w-full space-y-6">
        <h1 className="text-5xl font-bold text-cyan-400 tracking-tight">О проекте</h1>

        <div className="bg-black/40 rounded-lg p-6 border border-cyan-700">
          <p className="text-cyan-300 leading-relaxed">
            BLE Matrix — это веб-приложение для управления светодиодными матричными дисплеями через Bluetooth Low Energy.
          </p>

          <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">Функциональность</h2>

          <ul className="space-y-3 text-cyan-50">
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Подключение к ESP32 устройствам через BLE GATT
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              11 визуальных режимов (Snow, Matrix, Rainbow, Fire и др.)
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Текстовый дисплей с настройкой шрифта и цвета
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Аудиоэквалайзер с 6 типами фильтрации
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              PWA поддержка (работает офлайн)
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">Технологии</h2>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-black/30 rounded p-3 border border-cyan-800">
              <span className="font-medium text-cyan-300">React 18</span>
            </div>
            <div className="bg-black/30 rounded p-3 border border-cyan-800">
              <span className="font-medium text-cyan-300">TypeScript 5.x</span>
            </div>
            <div className="bg-black/30 rounded p-3 border border-cyan-800">
              <span className="font-medium text-cyan-300">Vite</span>
            </div>
            <div className="bg-black/30 rounded p-3 border border-cyan-800">
              <span className="font-medium text-cyan-300">Tailwind CSS 3.x</span>
            </div>
            <div className="bg-black/30 rounded p-3 border border-cyan-800">
              <span className="font-medium text-cyan-300">React Router v6</span>
            </div>
            <div className="bg-black/30 rounded p-3 border border-cyan-800">
              <span className="font-medium text-cyan-300">vite-plugin-pwa</span>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">Протокол BLE</h2>

          <p className="text-cyan-60 text-sm leading-relaxed">
            Приложение использует Web Bluetooth API для связи с ESP32 устройствами:
          </p>

          <ul className="mt-4 space-y-1 text-xs bg-black/30 rounded p-3 border border-cyan-800 text-cyan-60">
            <li><code className="text-cyan-400">Service UUID:</code> 0xFFE0 (GATT Generic Attribute Profile)</li>
            <li><code className="text-cyan-400">Characteristic UUID:</code> 0xFFE1</li>
            <li><code className="text-cyan-400">Notification Service:</code> 0x1BBd</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-900/50 text-cyan-400 text-xs border border-cyan-700">
            Progressive Web App
          </span>

          <span className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-900/50 text-cyan-400 text-xs border border-cyan-700">
            TypeScript Strict Mode
          </span>

          <span className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-900/50 text-cyan-400 text-xs border border-cyan-700">
            Mobile Responsive
          </span>
        </div>
      </div>
    </section>
  );
}
