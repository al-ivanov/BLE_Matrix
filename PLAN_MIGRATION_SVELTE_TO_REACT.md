# План миграции фронтенда с SvelteKit на React

## 1. Обзор текущего проекта

### Стек технологий:
- **Framework**: SvelteKit (Svelte 3)
- **Язык**: TypeScript
- **Бэкенд**: Express.js через adapter-node
- **PWA**: WorkBox service worker
- **Bluetooth API**: navigator.bluetooth (Web BLE API)
- **Рouter**: Встроенная router из SvelteKit
- **UI компоненты**: svelte-select, Material Icons

### Структура проекта:
```
src/
├── app.d.ts              # Type definitions
├── app.css               # Глобальные стили + Tailwind
├── hooks.ts              # Server-side logic (userid cookie)
├── lib/
│   ├── BluetoothTerminal.ts  # BLE connection manager
│   ├── commonData.ts         # Команды и маршруты
│   ├── Footer.svelte         # Футер
│   ├── stores.ts             # Svelte stores
│   └── header/Header.svelte   # Шапка с Bluetooth кнопками
├── routes/               # SvelteKit pages
│   ├── __layout.svelte      # Root layout
│   ├── about.svelte         # Статичная страница
│   ├── equalizer.svelte     # Эквалайзер (команда $1)
│   ├── index.svelte         # Главная (выбор эффектов)
│   ├── terminal.svelte      # Консольный терминал
│   ├── text.svelte          # Бегущая строка (команда $0)
│   └── todos/               # Интеграция с внешним API
├── static/               # Статические файлы
├── tests/                # Playwright E2E тесты
└── pwa-configuration.js  # PWA конфиг
```

### Ключевые паттерны:
1. **Bluetooth Terminal** — центральный класс для BLE-связи
2. **Svelte stores** — реактивное состояние (deviceName, mode, amplitude и др.)
3. **Context API** — передача bluetoothTerminal через setContext/getContext
4. **Prerendering** — статическая генерация страниц
5. **Form handling** — FormData для отправки команд устройству

---

## 2. Цели миграции

- Переписать UI компоненты на React
- Сохранить логику BluetoothTerminal (можно оставить как есть или мигрировать)
- Сохранить PWA функциональность (Service Worker)
- Перенести все визуальные режимы и эффекты
- Адаптировать под современный React 18+ экосистему

---

## 3. Рекомендуемый стек для нового проекта

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-scripts" || "vite + react"
  },
  "devDependencies": {
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "typescript": "^5.x",
    "tailwindcss": "^3.x",
    "react-router-dom": "^6.x"
  }
}
```

**Рекомендация**: Использовать Vite + React вместо create-react-app (быстрее, меньше bundle).

---

## 4. Архитектурная карта

### Текущая → Целевая

| Компонент SvelteKit | React эквивалент | Примечания |
|---------------------|------------------|-------------|
| `src/routes/*.svelte` | `src/pages/*.{tsx}` | Vite Router pages |
| `src/lib/stores.ts` | `context/` + `useState/Context` | React Context для Bluetooth state |
| `BluetoothTerminal` | `@ble-matrix/bluetooth-terminal` (класс) | Либо оставить как есть |
| `svelte-select` | `react-select` или кастомный Select | Нужно найти аналог |
| `hooks.ts` (cookie logic) | `_app.tsx` + `cookies.ts` | React Router hooks |
| Layout (`__layout.svelte`) | `_app.tsx` + `<Outlet>` | Vite Router layout |

---

## 5. Пошаговый план миграции

### Этап 0: Подготовка (1 день)

#### 5.1. Экспорт и анализ
```bash
# Сборка текущего проекта для анализа
npm run build

# Анализ структуры (можно использовать esbuild-register + parser)
```

#### 5.2. Создание нового проекта
```bash
npm create vite@latest ble-matrix-react -- --template react-ts
cd ble-matrix-react
npm install
npm install react-router-dom @types/react-router-dom tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 5.3. Конфигурация Tailwind
Копирование `tailwind.config.cjs` и адаптация под React:
```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

#### 5.4. Настройка PWA
- Копирование `svelte.config.js` → `vite.config.ts`
- Адаптация `pwa-configuration.js`
- Генерация manifest и service worker

### Этап 1: Базовая структура (1-2 дня)

#### 5.5. Layout компонент (`src/App.tsx`)
```tsx
// App.tsx — главный layout с Bluetooth шапкой
import BluetoothHeader from './components/BluetoothHeader';
import Footer from './Footer';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen">
        <BluetoothHeader />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/text" element={<TextMode />} />
            <Route path="/equalizer" element={<Equalizer />} />
            <Route path="/terminal" element={<Terminal />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
```

#### 5.6. Bluetooth Context (`context/BluetoothContext.tsx`)
```tsx
// context/BluetoothContext.tsx — замена Svelte stores + context
import React, { createContext, useContext, useState, useEffect } from 'react';

interface BluetoothState {
  deviceName: string;
  is_connected: boolean;
}

interface BluetoothContextType extends BluetoothState {
  setDeviceName: (name: string) => void;
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined);

export function BluetoothProvider({ children }: { children: React.ReactNode }) {
  const [deviceName, setDeviceName] = useState('kepi');
  const is_connected = deviceName !== 'kepi'; // упрощено

  return (
    <BluetoothContext.Provider value={{ deviceName, is_connected, setDeviceName }}>
      {children}
    </BluetoothContext.Provider>
  );
}

export function useBluetooth() {
  const context = useContext(BluetoothContext);
  if (!context) throw new Error('useBluetooth must be used within BluetoothProvider');
  return context;
}
```

#### 5.7. BluetoothHeader компонент (`components/BluetoothHeader.tsx`)
Перенос `src/lib/header/Header.svelte`:
- Кнопки Connect/Disconnect
- Отображение deviceName
- Логика подключения через BluetoothTerminal

### Этап 2: Core компоненты (3-4 дня)

#### 5.8. BluetoothTerminal интеграция
Варианты:
1. **Оставить как есть** — класс можно использовать из Node/browser как есть
2. **Вынести в отдельный пакет** — `@ble-matrix/bluetooth-terminal`
3. **Интегрировать напрямую** — импортировать класс

Рекомендация: Использовать как есть (создать утилитарную папку).

#### 5.9. Common commands (`utils/commands.ts`)
Перенос `src/lib/commonData.ts`:
```ts
// utils/commands.ts
export const modes = {
  Text: '$0',
  Eq: '$1',
};

export const commands = {
  GetConfig: '&!',
  Bridgest: '^',
  GetButtonCounter: '?',
  ChangeMod: '$',
  AutoChangePatterns: '!',
  Amplitude: '@',
};

export const routes = {
  mainPage: '/',
  text: '/text',
  equalizer: '/equalizer',
  terminal: '/terminal',
};
```

#### 5.10. Home/Главная страница (`pages/Home.tsx`)
Перенос `src/routes/index.svelte`:
- Select для выбора эффектов (Snow, Matrix и др.)
- Select для overlay effects
- UI с Tailwind

### Этап 3: Специализированные страницы (4-5 дней)

#### 5.11. TextMode (`pages/TextMode.tsx`)
Перенос `src/routes/text.svelte`:
- Form с текстовым input
- Select для цветов текста
- Range для скорости текста
- Отправка команд

#### 5.12. Equalizer (`pages/Equalizer.tsx`)
Перенос `src/routes/equalizer.svelte`:
- Select для типа эквалайзера (6 режимов)
- Checkbox автопереключения
- Range и Select для чувствительности, шума
- Multiplication factors

#### 5.13. Terminal (`pages/Terminal.tsx`)
Перенос `src/routes/terminal.svelte`:
- Terminal display (scrolling log area)
- Input + Send button
- Log entries с типами (in/out/error)

### Этап 4: Общие компоненты (2-3 дня)

#### 5.14. Select компонент
Варианты замены `svelte-select`:
1. **react-select** — популярный, но тяжелый
2. **Custom select** — легковесно с Tailwind + state management
3. **Formik/Yup** — если нужна форма

Рекомендация: Custom Select для простоты (можно написать за 1-2 часа).

#### 5.15. Footer компонент (`Footer.tsx`)
Перенос `src/lib/Footer.svelte`

#### 5.16. Типы и interfaces
Создание `types/`:
```ts
// types/bluetooth-terminal.ts
export interface BluetoothTerminal {
  connect(): Promise<any>;
  disconnect(): void;
  send(data: string): Promise<void>;
  receive?(data: string): void;
  getDeviceName(): string;
}

// types/common.ts
export interface SelectOption<T = string> {
  value: T;
  label: string;
}
```

### Этап 5: PWA и Service Worker (1-2 дня)

#### 5.17. vite.config.ts
Настройка `vite-plugin-pwa`:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import pwaConfiguration from './pwa-configuration.js';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globDirectory: './dist/',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,manifest}'],
        dontCacheBustURLsMatching: /-[a-f0-9]{8}\./,
      },
      ...pwaConfiguration.manifest,
    }),
  ],
});
```

### Этап 6: Миграция данных и состояние (1-2 дня)

#### 5.18. Hooks для cookie auth (`hooks/useAuth.ts`)
Перенос логики из `src/hooks.ts`:
```ts
// hooks/useAuth.ts
import { useEffect } from 'react';

export function useUser() {
  const [userid, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const cookies = parseCookies(); // нужно добавить cookie parsing
    const useridCookie = cookies['userid'];
    if (!useridCookie) {
      setUserId(crypto.randomUUID());
      document.cookie = `userid=${useridCookie}; path=/; httpOnly=true`;
    } else {
      setUserId(useridCookie);
    }
  }, []);

  return userid;
}
```

### Этап 7: Тестирование (1-2 дня)

#### 5.19. Playwright миграция
Адаптация `playwright.config.ts`:
- Обновление base URL на новый порт или dev сервер
- Адаптация селекторов (Svelte → React)
- Проверка всех эффектов и команд

### Этап 8: Оптимизация и полировка (1 день)

#### 5.20. Задачи:
- Bundle анализ (rollup-plugin-analyzer)
- Lazy loading для страниц
- Memoization (React.memo, useMemo)
- Accessibility проверка (axe-core)

---

## 6. Ключевые различия Svelte vs React

| Аспект | Svelte | React |
|--------|--------|-------|
| **State** | Stores + Context | useState + Context |
| **Lifecycle** | Lifecycle hooks (`onMount`) | useEffect |
| **Context** | setContext/getContext | useContext |
| **Forms** | bind:value, on:submit | Controlled components (useState) |
| **Props** | Implicit typing | TypeScript интерфейсы/типы props |
| **Events** | `on:click={handler}` | `<onClick={handler}>` |
| **Conditional** | `{#if} ... {/if}` | `{condition && <Component />}` или `{condition ? <A /> : <B />}` |

---

## 7. Пример миграции (index.svelte → Home.tsx)

### Исходный код Svelte:
```svelte
<script context="module" lang="ts">
  export const prerender = true;
</script>

<script lang="ts">
  import type { BluetoothTerminal } from '$lib/BluetoothTerminal';
  
  let modes = [
    {value: '2', label: 'Снег'},
    {value: '3', label: 'Мячик скачет из угла в угол'},
    ...
  ];

  let mode = modes[0];

  async function handleSelectMode({ detail }) {
    await bluetoothTerminal.send(`$${detail.value}`);
  }

  // ... другие handlers
</script>

<section>
  <div class="block">
    <Select items={modes} value={mode} on:select={handleSelectMode} />
  </div>
</section>
```

### Перенос на React:
```tsx
// pages/Home.tsx
import React, { useState } from 'react';
import Select from '../components/CustomSelect';

interface EffectMode {
  value: string;
  label: string;
}

const modes: EffectMode[] = [
  { value: '2', label: 'Снег' },
  { value: '3', label: 'Мячик скачет из угла в угол' },
  { value: '4', label: '3 маленьких шарика скачут' },
  // ... остальные
];

export default function Home() {
  const [mode, setMode] = useState<EffectMode>(modes[0]);

  const bluetoothTerminal: BluetoothTerminal = /* injected via context/proxy */;

  async function handleSelectMode(event: React.FormEvent) {
    event.preventDefault();
    await bluetoothTerminal.send(`$${mode.value}`);
  }

  return (
    <section className="flex flex-col justify-center items-center flex-1">
      <div className="block w-full">
        <p className="w-full block text-cyan-50">Выбери тип режима</p>
        <Select
          options={modes}
          selectedValue={mode.label}
          onSelect={handleSelectMode}
        />
      </div>
    </section>
  );
}
```

---

## 8. Чеклист миграции

### Критические компоненты:
- [ ] BluetoothHeader (подключение/отключение)
- [ ] Home (главная с выбором эффектов)
- [ ] TextMode (бегущая строка)
- [ ] Equalizer (эквалайзер)
- [ ] Terminal (консоль)
- [ ] Footer

### State management:
- [ ] Миграция stores на Context API
- [ ] Инициализация bluetoothTerminal в контексте
- [ ] Обработчики событий от BluetoothTerminal

### PWA:
- [ ] Генерация manifest.webmanifest
- [ ] Service worker регистрация
- [ ] Offline функциональность

### Тестирование:
- [ ] E2E тесты Playwright
- [ ] Unit тесты для утилит ( Jest/Vitest)
- [ ] Визуальный регрессионный тест (playwright screenshot)

---

## 9. Оценка времени и ресурсов

| Этап | Оценочное время | Ответственный |
|------|-----------------|---------------|
| Подготовка | 1 день | Разработчик 1 |
| Базовая структура | 1-2 дня | Разработчик 1 |
| Core компоненты | 3-4 дня | Разработчики 1+2 |
| Специализированные страницы | 4-5 дней | Разработчики 1+2 |
| Общие компоненты | 2-3 дня | Разработчик 1 |
| PWA и Service Worker | 1-2 дня | Разработчик 1 |
| Тестирование | 1-2 дня | QA + Разработчики |
| Оптимизация | 1 день | Senior разработчик |

**Итого**: ~3-4 недели для команды из 2 человек (full-stack).

---

## 10. Риски и рекомендации

### Риски:
1. **Потеря PWA функциональности** — нужно внимательно тестировать service worker
2. **Bluetooth Terminal интеграция** — убедиться что работает в Node + browser
3. **Типизация команд** — проверить все protocol commands при переносе
4. **Tailwind конфигурация** — адаптация config под React

### Рекомендации:
1. **Инкрементальная миграция** — мигрировать модуль за модулем, а не всё сразу
2. **Feature flags** — возможность откатиться на Svelte версию при необходимости
3. **E2E тесты как приоритет** — писать тесты параллельно с миграцией
4. **Документация протокола** — сохранить в отдельном файле все BLE команды

---

## 11. Post-migration checklist

- [ ] Сборка без ошибок: `npm run build`
- [ ] Тесты проходят: `npm test`
- [ ] PWA работает офлайн
- [ ] Bluetooth подключение работает
- [ ] Все эффекты визуализируются корректно
- [ ] TypeScript типы проверены (`tsc --noEmit`)

---

## 12. Следующие шаги после миграции

1. **Оптимизация bundle** — анализ через `rollup-plugin-analyzer`
2. **Код-ревью** — проверка на React best practices
3. **Дополнительные фичи**:
   - Dark mode (React Context)
   - TypeScript строгая типизация
   - Unit тесты с Vitest/Jest
