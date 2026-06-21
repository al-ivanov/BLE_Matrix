# План миграции BLE_Matrix: SvelteKit → React

Документ описывает пошаговый переход фронтенда приложения управления LED-кепкой по Bluetooth с **SvelteKit 1 + Svelte 3** на **React**. Прошивка ESP32 (`firmware-esp32/`) и серверная логика BLE не затрагиваются.

---

## 1. Текущее состояние проекта

### 1.1. Стек

| Слой | Технология |
|------|------------|
| Фреймворк | SvelteKit (`@sveltejs/kit` next) |
| UI | Svelte 3, Tailwind CSS 3 |
| Язык | TypeScript 4.6 |
| Сборка | Vite (через SvelteKit) |
| Деплой | `@sveltejs/adapter-node` → Express (`server.js`, порт 8080) |
| PWA | `vite-plugin-pwa` + Workbox, отдельный скрипт `pwa.js` |
| Тесты | Playwright (1 тест на `/about`) |
| CI | GitHub Actions: `npm ci` → `npm run build` → `pm2 restart` |

### 1.2. Структура фронтенда

```
src/
├── app.html, app.css, app.d.ts
├── hooks.ts                    # cookie userid
├── service-worker.ts           # Workbox + push
├── routes/
│   ├── __layout.svelte         # Header, Footer, яркость, slot
│   ├── index.svelte            # Главная: режимы и эффекты
│   ├── text.svelte             # Бегущая строка
│   ├── equalizer.svelte        # Эквалайзер
│   ├── terminal.svelte         # Терминал
│   ├── about.svelte            # Шаблон create-svelte (не используется в навигации)
│   └── todos/                  # Демо create-svelte (не используется в навигации)
└── lib/
    ├── BluetoothTerminal.ts    # Ядро BLE — чистый TS, без Svelte
    ├── terminal.ts             # Синглтон BluetoothTerminal
    ├── commonData.ts           # Команды, режимы, маршруты
    ├── stores.ts               # Svelte writable stores
    ├── env.ts                  # isDev / isProd
    ├── form.ts                 # SvelteKit progressive enhancement
    ├── header/Header.svelte
    ├── Footer.svelte
    └── Terminal.svelte
```

### 1.3. Функциональные страницы (ядро приложения)

| Маршрут | Назначение | Ключевые зависимости |
|---------|------------|----------------------|
| `/` | Выбор режима и эффекта LED | `svelte-select`, BLE `send` |
| `/text` | Бегущая строка: цвет, скорость, текст | `svelte-select`, автоотправка `modes.Text` при подключении |
| `/equalizer` | Настройки эквалайзера | `svelte-select`, stores `amplitude`, `buttonCounter`, `autoChangePatterns` |
| `/terminal` | Отладочный терминал BLE | Переопределение `receive` и `_log` |

### 1.4. Что можно не переносить

Страницы `/about` и `/todos` — остатки шаблона `create-svelte`. Они не входят в `Footer` и не связаны с BLE. **Рекомендация:** не мигрировать, а удалить вместе со Svelte-кодом.

### 1.5. Код, переносимый без изменений (или с минимальными)

- `src/lib/BluetoothTerminal.ts` — класс Web Bluetooth API
- `src/lib/commonData.ts` — константы команд и маршрутов
- `src/lib/env.ts` — флаги окружения
- `static/` — иконки, manifest, normalize.css, legacy JS
- `src/app.css` — Tailwind + стили range-слайдеров (подключить в React)
- `firmware-esp32/` — без изменений

### 1.6. Известные архитектурные проблемы (исправить при миграции)

1. **Конфликт `receive`:** `Header.svelte` и `Terminal.svelte` оба переопределяют `bluetoothTerminal.receive`. На странице терминала обработчик из Header перезаписывается. В React стоит ввести **единый диспетчер событий** (pub/sub или callback-список).
2. **Глобальный синглтон терминала** (`terminal.ts`) + Svelte context — в React заменить на **React Context + Provider** в корне приложения.
3. **Устаревшие зависимости:** SvelteKit next, Node 16 в CI — хороший повод обновить Node до 20 LTS.

---

## 2. Выбор целевого стека React

### 2.1. Рекомендуемый вариант: **Vite + React + React Router**

**Почему:**

- Приложение по сути **SPA с клиентским BLE**; SSR SvelteKit почти не используется (все страницы с `prerender = true`).
- Минимальная связь с сервером: cookie `userid` в `hooks.ts` используется только демо `/todos`.
- Express-сервер (`server.js`) может раздавать статический `dist/` вместо SvelteKit handler.
- Проще миграция: один `index.html`, знакомый Vite, тот же Tailwind и PWA-плагин.

### 2.2. Альтернатива: **Next.js (App Router)**

Имеет смысл, если планируется:
- серверные API для своего бэкенда;
- SSR/SEO для лендинга;
- единый full-stack фреймворк как замена SvelteKit.

Для текущего BLE-PWA **избыточен**, но допустим.

### 2.3. Зафиксированный целевой стек (рекомендация)

| Компонент | Выбор |
|-----------|-------|
| Сборка | Vite 6 |
| UI | React 19 |
| Роутинг | React Router 7 |
| Стили | Tailwind CSS 3 (существующий конфиг) |
| Состояние | React Context + `useReducer` (или Zustand при росте сложности) |
| Select | `react-select` или `@radix-ui/react-select` (замена `svelte-select`) |
| PWA | `vite-plugin-pwa` (тот же подход) |
| Типизация | TypeScript 5.x |
| Тесты | Playwright (обновить сценарии под реальные страницы) |
| Деплой | Express static + fallback на `index.html` |

---

## 3. Стратегия миграции

### 3.1. Подход: «параллельная ветка» (рекомендуется)

Не переписывать Svelte «на месте», а:

1. Создать ветку `feat/react-migration`.
2. Поднять React-приложение в `frontend/` **или** заменить корень проекта после готовности.
3. Держать Svelte рабочим на `main` до полного parity-тестирования React-версии.
4. Переключить CI и удалить Svelte одним PR.

**Плюсы:** можно сравнивать поведение, откатиться, тестировать BLE на железе параллельно.

### 3.2. Альтернатива: поэтапная замена в том же репозитории

Менее удобна для SvelteKit → React (разные entry points, нет официального «micro-frontend» пути). **Не рекомендуется.**

### 3.3. Критерии готовности (Definition of Done)

- [ ] Все 4 основные страницы работают идентично Svelte-версии
- [ ] Подключение/отключение BLE (SmartHat / SmartMatrix)
- [ ] Автопереход маршрута при смене режима с устройства (`$0` → `/text`, `$1` → `/equalizer`)
- [ ] Слайдер яркости, все select и range отправляют корректные команды
- [ ] PWA: manifest, service worker, offline shell
- [ ] Production build + Express + PM2
- [ ] Playwright-тесты на ключевые маршруты
- [ ] Удалён весь Svelte-код и зависимости

---

## 4. Фазы миграции

### Фаза 0. Подготовка (0.5–1 день)

**Задачи:**

1. Зафиксировать эталонное поведение:
   - записать сценарии ручного тестирования BLE (чеклист в конце документа);
   - снять скриншоты/видео основных экранов.
2. Обновить Node до 20 LTS локально и в CI.
3. Создать ветку `feat/react-migration`.

**Артефакты:** чеклист регрессии, ветка в git.

---

### Фаза 1. Каркас React-приложения (1 день)

**Задачи:**

1. Инициализировать проект:

   ```bash
   npm create vite@latest . -- --template react-ts
   # или в подпапке frontend/
   ```

2. Установить зависимости:

   ```bash
   npm install react-router-dom
   npm install -D tailwindcss postcss autoprefixer
   npm install -D vite-plugin-pwa workbox-* 
   npm install react-select
   # опционально: zustand
   ```

3. Перенести конфигурацию:
   - `tailwind.config.cjs` → обновить `content` на `./src/**/*.{tsx,ts}`
   - `postcss.config.cjs` — без изменений
   - скопировать `src/app.css` → `src/index.css`
   - скопировать `static/` → `public/`

4. Настроить `index.html`:
   - meta PWA, Material Icons, `manifest.json`
   - `id="root"` (уже есть в текущем `app.html`)

5. Настроить алиасы путей (`@/` → `src/`) в `vite.config.ts` и `tsconfig.json`.

6. Подключить `vite-plugin-pwa` — адаптировать `pwa-configuration.js` под выход Vite (`dist/` вместо `.svelte-kit/`).

**Структура целевого `src/`:**

```
src/
├── main.tsx
├── App.tsx
├── index.css
├── lib/
│   ├── BluetoothTerminal.ts    # копия
│   ├── commonData.ts           # копия
│   └── env.ts                  # копия (import.meta.env.DEV)
├── context/
│   ├── BluetoothContext.tsx    # Provider + useBluetooth()
│   └── DeviceStateContext.tsx  # замена stores.ts
├── components/
│   ├── layout/
│   │   ├── RootLayout.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── Terminal.tsx
│   └── SelectField.tsx         # обёртка над react-select
├── pages/
│   ├── HomePage.tsx
│   ├── TextPage.tsx
│   ├── EqualizerPage.tsx
│   └── TerminalPage.tsx
└── routes.tsx                  # React Router config
```

**Артефакты:** `npm run dev` открывает пустой shell с layout.

---

### Фаза 2. Состояние и BLE-контекст (1–2 дня)

#### 2.1. Замена Svelte stores

Текущие stores (`stores.ts`):

| Store | Начальное значение | Кто пишет | Кто читает |
|-------|-------------------|-----------|------------|
| `deviceName` | `'kepi'` | Header (connect/disconnect), receive | Layout, Text, Equalizer |
| `bridgest` | `100` | Header receive, Layout slider | Layout |
| `mode` | `0` | Header receive | — |
| `amplitude` | `60` | Header receive | Equalizer |
| `buttonCounter` | `0` | Header receive | Equalizer (select) |
| `autoChangePatterns` | `false` | Header receive | Equalizer (checkbox) |

**React-реализация (вариант A — Context + useReducer):**

```tsx
// types
type DeviceState = {
  deviceName: string;
  bridgest: number;
  mode: number;
  amplitude: number;
  buttonCounter: number;
  autoChangePatterns: boolean;
};

// DeviceStateContext.tsx
// dispatch({ type: 'SET_BRIDGEST', payload: 120 })
```

**React-реализация (вариант B — Zustand):** проще для подписок из класса `BluetoothTerminal` вне React-дерева.

#### 2.2. BluetoothContext

```tsx
// BluetoothContext.tsx
const terminal = new BluetoothTerminal(0xFFE0, 0xFFE1, '\n', '\n');

// Единый обработчик receive — диспетчер:
terminal.receive = (data: string) => {
  parseConfigResponse(data);      // логика из Header
  terminalEventBus.emit('data', data); // для Terminal page
};
```

Вынести парсинг `&!=...;` из `Header.svelte` в `lib/bleProtocol.ts`:

- `parseConfigResponse(data: string): Partial<DeviceState>`
- `resolveRouteFromMode(command: string): string | null`

#### 2.3. Навигация при смене режима с устройства

Svelte: `goto(newRoute)` внутри `receive`, с проверкой `$page.url.pathname !== '/terminal'`.

React:

```tsx
const location = useLocation();
const navigate = useNavigate();

// в обработчике:
if (location.pathname !== '/terminal') {
  navigate(newRoute);
}
```

**Артефакты:** connect/disconnect обновляет `deviceName`; слайдер яркости шлёт `^value`.

---

### Фаза 3. Layout и общие компоненты (1 день)

#### 3.1. RootLayout (`__layout.svelte` → `RootLayout.tsx`)

| Svelte | React |
|--------|-------|
| `<slot />` | `<Outlet />` из React Router |
| `setContext('bluetoothTerminal', ...)` | `<BluetoothProvider>` |
| `deviceName.subscribe(...)` | `useDeviceState()` |
| `on:change={handleChangeBridgest}` | `onChange` на `<input type="range">` |
| `class:blur={...}` | `className={cn(..., isDisconnected && 'blur')}` |
| `{#if deviceNameLabel === defaultDeviceName && isProd}` | условный рендер с `import.meta.env.PROD` |

#### 3.2. Header (`Header.svelte` → `Header.tsx`)

- Кнопки connect/disconnect → `onClick`
- Логику `receive` перенести в `BluetoothContext` / `bleProtocol.ts`
- `material-icons` — без изменений

#### 3.3. Footer (`Footer.svelte` → `Footer.tsx`)

| Svelte | React |
|--------|-------|
| `$page.url.pathname` | `useLocation().pathname` |
| `sveltekit:prefetch` | `<Link prefetch="intent">` (React Router 6.4+) или обычный `<Link>` |
| `class:active={...}` | `NavLink` с `({ isActive }) => ...` |

**Артефакты:** навигация между 4 страницами, фиксированный header/footer.

---

### Фаза 4. Страницы (2–3 дня)

#### 4.1. HomePage (`index.svelte`)

- Два `Select` для режимов и эффектов
- `handleSelectMode` → `send('$' + value)`
- `handleSelectEffect` → `` send('`' + value) ``

Данные `modes` и `effects` — вынести в `lib/effectOptions.ts` (константы).

#### 4.2. TextPage (`text.svelte`)

- `onMount` + `ref.focus()` → `useRef` + `useEffect`
- `deviceName.subscribe` → `useEffect` на `deviceName`, при подключении `send(modes.Text)`
- Форма отправки текста, слайдер скорости `#value`, select цвета `?value`

#### 4.3. EqualizerPage (`equalizer.svelte`)

- Самая насыщенная страница: 4 select, 2 range, checkbox
- Подписки на `amplitude`, `buttonCounter`, `autoChangePatterns` → `useEffect` / прямое чтение из store
- При монтировании и подключении — `send(modes.Eq)`

#### 4.4. TerminalPage (`terminal.svelte` + `Terminal.svelte`)

- Список логов: `useState<LogEntry[]>`
- Подписка на `terminalEventBus` в `useEffect` с cleanup
- Переопределение `_log` — вынести в хук `useTerminalLogging(terminal)`

**Маппинг `svelte-select` → `react-select`:**

```tsx
<Select
  options={modes}
  value={selectedMode}
  onChange={(opt) => handleSelectMode(opt)}
  getOptionLabel={(o) => o.label}
  getOptionValue={(o) => o.value}
/>
```

Стилизовать под тёмную тему (кастомные `styles` prop в react-select).

**Артефакты:** полный функциональный parity всех экранов.

---

### Фаза 5. Роутинг (0.5 дня)

```tsx
// routes.tsx
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'text', element: <TextPage /> },
      { path: 'equalizer', element: <EqualizerPage /> },
      { path: 'terminal', element: <TerminalPage /> },
    ],
  },
]);
```

Удалить маршруты `/about`, `/todos` (или оставить редирект на `/`).

---

### Фаза 6. PWA и Service Worker (1 день)

#### 6.1. vite-plugin-pwa

- Перенести логику из `pwa-configuration.js`
- Убрать отдельный `pwa.js` post-build скрипт, если плагин генерирует SW напрямую в `dist/`
- Проверить `manifest.webmanifest` и пути к иконкам в `public/icons/`

#### 6.2. service-worker.ts

Текущий файл смешивает регистрацию SW (код для `window`) и Workbox routes (код для SW). В React:

- Регистрацию SW — через `vite-plugin-pwa` (`registerType: 'autoUpdate'`)
- Кастомные Workbox routes — в `workbox.config` или `injectManifest` стратегии плагина
- Push-обработчик — перенести в `src/sw.ts` при `injectManifest`

#### 6.3. Проверки PWA

- Lighthouse PWA audit
- Установка на Android (Add to Home Screen)
- Работа в Chrome с Web Bluetooth (только HTTPS или localhost)

---

### Фаза 7. Production-сервер и деплой (0.5–1 день)

#### 7.1. Замена SvelteKit handler

Текущий `server.js`:

```js
import { handler } from './build/handler.js';
app.use(handler);
```

Новый вариант для SPA:

```js
import express from 'express';
import path from 'path';

const app = express();
const dist = path.join(process.cwd(), 'dist');

app.get('/healthcheck', (_, res) => res.end('ok'));
app.use(express.static(dist));
app.get('*', (_, res) => res.sendFile(path.join(dist, 'index.html')));

app.listen(8080);
```

#### 7.2. package.json scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "playwright test"
  }
}
```

#### 7.3. PM2 и CI

- `pm2.config.js` — без изменений (тот же `server.js`)
- `.github/workflows/main.yml` — обновить Node 20, убрать `svelte-kit`-специфичные шаги

**Артефакты:** `npm run build` → `node server.js` → приложение на `:8080`.

---

### Фаза 8. Тестирование (1 день)

#### 8.1. Playwright

Заменить тест `/about` на реальные сценарии:

```ts
test('главная страница загружается', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Выбери тип режима')).toBeVisible();
});

test('навигация через footer', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Бегущая строка').click();
  await expect(page).toHaveURL('/text');
});
```

BLE в Playwright не тестируется без эмуляции — оставить ручной чеклист.

#### 8.2. Ручной BLE-чеклист

- [ ] Connect к SmartHat / SmartMatrix
- [ ] Disconnect
- [ ] Запрос конфигурации `&!` после connect
- [ ] Яркость `^N` меняет LED
- [ ] Смена режима с телефона → переход на `/text` или `/equalizer`
- [ ] На `/terminal` смена режима **не** перенаправляет
- [ ] Отправка текста, все слайдеры и select на каждой странице
- [ ] Переподключение после потери связи (reconnect в `BluetoothTerminal`)

---

### Фаза 9. Удаление Svelte и финализация (0.5 дня)

**Удалить файлы и зависимости:**

```
# Файлы
svelte.config.js
src/**/*.svelte
src/hooks.ts
src/app.html
src/app.d.ts
src/routes/          # вся папка SvelteKit
src/lib/form.ts
pwa.js               # если PWA полностью в vite-plugin-pwa
.eslintrc.cjs        # заменить на eslint flat config для React

# npm uninstall
@sveltejs/kit @sveltejs/adapter-auto @sveltejs/adapter-node
svelte svelte-check svelte-preprocess
eslint-plugin-svelte3 prettier-plugin-svelte
svelte-select
```

**Добавить:**

```
eslint-plugin-react-hooks
@types/react @types/react-dom
```

**Обновить README** с инструкциями для React-стека.

---

## 5. Таблица соответствия Svelte → React

| Svelte / SvelteKit | React |
|--------------------|-------|
| `.svelte` компонент | `.tsx` функциональный компонент |
| `export let prop` | props: `interface Props { ... }` |
| `$: derived` | `useMemo` |
| `onMount` | `useEffect(() => {}, [])` |
| `bind:value` | `value` + `onChange` |
| `bind:this={ref}` | `useRef` |
| `{#if}` / `{#each}` | `&&` / `.map()` |
| `class:foo={bar}` | `className={bar ? 'foo' : ''}` |
| `<slot>` | `children` prop или `<Outlet>` |
| `setContext` / `getContext` | `React.createContext` |
| `writable` store | `useState`, `useReducer`, Zustand |
| `store.subscribe` | хук контекста / Zustand |
| `$page` | `useLocation`, `useParams` |
| `goto()` | `useNavigate()` |
| `svelte:head` | `react-helmet-async` или route `meta` в React Router 6.4+ |
| `use:enhance` (form) | не нужен (нет server actions) |
| `svelte-select` | `react-select` |
| `svelte/transition` | CSS transitions / `framer-motion` (если понадобится) |
| `$app/env` `browser` | `typeof window !== 'undefined'` |
| `prerender = true` | статический SPA build |
| `@sveltejs/adapter-node` | Express static |

---

## 6. Риски и митигация

| Риск | Вероятность | Митигация |
|------|-------------|-----------|
| Web Bluetooth работает только в Chrome/Edge | Средняя | Документировать; UI-предупреждение для неподдерживаемых браузеров |
| Потеря PWA при неправильной настройке SW | Средняя | Тест Lighthouse; проверка `sw.js` в `dist/` |
| Регрессия BLE-команд | Высокая | Чеклист команд; сравнение с Svelte-веткой на устройстве |
| Конфликт обработчиков `receive` | Уже есть | Единый диспетчер в миграции |
| Стили `svelte-select` vs `react-select` | Средняя | Кастомные styles; можно сверстать native `<select>` для простых списков |
| HTTPS для BLE в production | Высокая | Убедиться, что деплой на HTTPS (BLE API требует secure context) |

---

## 7. Оценка сроков

| Фаза | Оценка |
|------|--------|
| 0. Подготовка | 0.5–1 день |
| 1. Каркас | 1 день |
| 2. Состояние и BLE | 1–2 дня |
| 3. Layout | 1 день |
| 4. Страницы | 2–3 дня |
| 5. Роутинг | 0.5 дня |
| 6. PWA | 1 день |
| 7. Деплой | 0.5–1 день |
| 8. Тестирование | 1 день |
| 9. Cleanup | 0.5 дня |
| **Итого** | **9–12 рабочих дней** (1 разработчик) |

При работе 2–3 часа в день — около 3–4 недель календарно.

---

## 8. Порядок PR-ов (рекомендуемая нарезка)

1. **PR-1:** Каркас Vite + React + Tailwind + Router + пустой layout
2. **PR-2:** BluetoothContext, DeviceState, bleProtocol, Header
3. **PR-3:** HomePage + TextPage
4. **PR-4:** EqualizerPage + TerminalPage + Footer
5. **PR-5:** PWA + production server
6. **PR-6:** Тесты, CI, удаление Svelte

Каждый PR должен собираться (`npm run build`) и не ломать деплой.

---

## 9. Чеклист команд BLE (справочник для тестирования)

| Команда | Назначение | Страница |
|---------|------------|----------|
| `&!` | Запрос конфигурации | Header (после connect) |
| `^N` | Яркость (2–255) | Layout |
| `$N` | Режим LED | Home |
| `` `N `` | Эффект | Home |
| `$0` / `$1` | Переключение text/eq (с устройства) | Header receive → navigate |
| `?N` | Цвет текста / паттерн EQ | Text / Equalizer |
| `#N` | Скорость текста | Text |
| `@N` | Чувствительность EQ | Equalizer |
| `*N` | Фильтр шумов | Equalizer |
| `!0` / `!1` | Автосмена паттернов | Equalizer |
| `aFN` | Множитель чувствительности | Equalizer |
| `sAN` | Размер семплов | Equalizer |
| `bBN` | Количество полос | Equalizer |

---

## 10. Ссылки

- [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
- [Vite PWA plugin](https://vite-pwa-org.netlify.app/)
- [React Router](https://reactrouter.com/)
- [react-select](https://react-select.com/home)

---

*Документ создан на основе анализа репозитория BLE_Matrix (SvelteKit, июнь 2025).*
