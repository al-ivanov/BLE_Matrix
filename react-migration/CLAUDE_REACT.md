# CLAUDE.md — React Migration Project

Этот файл предоставляет руководство для Claude Code при работе с проектом BLE Matrix на React.

## Обзор проекта

**BLE Matrix** — это **Vite + React приложение PWA** (прогрессивное веб-приложение) для Bluetooth Low Energy (BLE) связи со светодиодными матричными дисплеями. Приложение подключается к устройствам ESP32 через BLE и управляет различными визуальными эффектами.

**Ключевые технологии:**
- React 18 + Vite (вместо SvelteKit)
- TypeScript в строгом режиме
- PWA с vite-plugin-pwa
- Bluetooth Web API (navigator.bluetooth)
- Tailwind CSS для стилизации
- React Router v6

## Архитектура

### Основные модули

#### Bluetooth Context (`context/BluetoothContext.tsx`)
Замена Svelte stores на React Context API:
- Управляет состоянием подключения (isConnected, deviceName)
- Обеспечивает методы connect(), disconnect(), send()
- Парсит команды от устройства

#### Bluetooth Terminal (`utils/bluetooth-terminal.ts`)
Класс для управления BLE-соединениями (перенесён из оригинального проекта):
- Подключается к ESP32 с UUID: `0xFFE0` / `0xFFE1`
- Обрабатывает уведомления GATT
- Кэширует команды и разбивает большие записи на части (40 байт)

#### React Router (`src/App.tsx`)
Главный layout с маршрутизацией:
```tsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/text" element={<TextMode />} />
  <Route path="/equalizer" element={<Equalizer />} />
  <Route path="/terminal" element={<Terminal />} />
  <Route path="/about" element={<About />} />
</Routes>
```

### Service Worker & PWA
Конфигурация в `vite.config.ts`:
- `vite-plugin-pwa` создаёт service worker и манифест
- Иконки: `/favicon.svg`, `/public/icons.svg` (512x512)
- Манифест: `public/manifest.webmanifest`

## Команды разработки

```bash
# Разработка (hot reload)
npm run dev

# Production сборка (с генерацией PWA)
npm run build

# Предпросмотр сборки
npm run preview

# Типизация
npm run check

# Linting
npm run lint
```

## Поток данных

1. **Пользователь выбирает эффект** → React state обновляется
2. **React Context** → BluetoothTerminal.send() отправляет команду устройству
3. **Bluetooth Terminal** → GATT write через navigator.bluetooth
4. **Ответ устройства** → onnotify событие обрабатывается в BluetoothTerminal
5. **Парсинг команд** → Switch на '$', '@', '^' и т.д.
6. **Обновление UI** → Через Context или useState

## Протокол BLE команд

| Команда | Кодирование | Описание |
|---------|-------------|----------|
| GetConfig | `&!` | Запрос конфигурации устройства |
| ChangeMod | `$0-10` | Выбор режима (0=Text, 1=Eq, 2=Snow и др.) |
| Amplitude | `@value` | Установка яркости 0-255 |
| Bridgest | `^value` | Установить контраст LCD (2-255) |
| Button Counter | `?` | Состояние кнопки устройства |
| Auto Patterns | `!0/1` | Автопереключение паттернов |

### Режимы визуализации

| Код | Название | Описание |
|-----|----------|----------|
| 0 | Text Mode | Бегущая строка текста |
| 1 | Equalizer | Аудиоэквалайзер (6 типов) |
| 2 | Snow | Эффект снега |
| 3 | Bouncing Ball | Скачущий мячик |
| 4 | 3 Balls | 3 шарика |
| 5-9 | Rainbow, Fire и др. | Дополнительные эффекты |

## Структура проекта

```
react-migration/
├── context/                  # React Context
│   └── BluetoothContext.tsx ✅
├── src/
│   ├── components/          # Reusable компоненты
│   │   ├── BluetoothHeader.tsx ✅
│   │   └── Footer.tsx ✅
│   ├── pages/               # React Router страницы
│   │   ├── Home.tsx ✅
│   │   ├── TextMode.tsx ✅
│   │   ├── Equalizer.tsx ✅
│   │   ├── Terminal.tsx ✅
│   │   └── About.tsx ✅
│   ├── components/          # UI компоненты
│   │   └── CustomSelect.tsx ✅
│   ├── App.tsx ✅            # Главный layout
│   ├── main.tsx ✅           # Entry point
│   ├── index.css ✅          # Base CSS + Tailwind
│   └── App.css ✅            # App styles
├── utils/                   # Утилиты
│   ├── bluetooth-terminal.ts ✅ (из оригинала)
│   └── commands.ts          # Протокол BLE команд
├── types/                   # TypeScript типы
│   └── bluetooth-terminal.d.ts ✅
├── tailwind.config.js ✅     # Tailwind конфигурация
├── vite.config.ts ✅         # Vite + PWA
├── tsconfig*.json           # TypeScript конфиги
├── index.html ✅             # HTML template
├── public/
│   ├── manifest.webmanifest ✅
│   ├── favicon.svg ✅
│   └── icons.svg ✅          # 512x512 PWA иконка
```

## Особенности миграции SvelteKit → React

| Аспект | SvelteKit (оригинал) | React (новая версия) |
|--------|---------------------|----------------------|
| **State** | Stores (`$deviceName`) | Context + useState |
| **Router** | SvelteKit routes | React Router v6 |
| **Context API** | `setContext/getContext` | `createContext/useContext` |
| **Lifecycle** | `onMount()` | `useEffect()` |
| **Forms** | `bind:value` | Controlled (useState) |
| **PWA** | WorkBox через svelte.config.js | vite-plugin-pwa |

## Ключевые файлы

### context/BluetoothContext.tsx
Основной Context для управления состоянием Bluetooth соединения. Используется в любой компоненте через `useBluetooth()`.

### utils/bluetooth-terminal.ts
Класс BLE связи, **перенесён из оригинального проекта** (469 строк). Работает как есть без изменений.

### vite.config.ts
Конфигурация с PWA поддержкой:
- Service worker генерация
- Manifest и иконки
- Стратегия кэширования Network-first

## Примечания по разработке

### Использование Bluetooth в компонентах
```tsx
import { useBluetooth } from '../context/BluetoothContext';

function MyComponent() {
  const { isConnected, connect, disconnect, deviceName } = useBluetooth();
  
  return (
    <button onClick={connect} disabled={isConnected}>
      Connect Bluetooth Device
    </button>
  );
}
```

### Отправка команд устройству
```tsx
const bluetoothTerminal = bluetoothTerminal as any; // Из main.tsx

await bluetoothTerminal.send(`$0`); // Переключить на текстовый режим
await bluetoothTerminal.send(`@60`); // Яркость 60%
```

### Типы BluetoothTerminal
См. `types/bluetooth-terminal.d.ts` для расширенных типов.

## Дальнейшая разработка

При работе с проектом:
1. Всегда запускайте через `npm run dev` для hot reload
2. Перед коммитом выполняйте: `npm run lint` + `npm run check`
3. Для PWA сборки используйте: `npm run build`
4. Проверьте manifest.webmanifest после изменений иконок

## Примечания по деплою

- Сборка лежит в `build/`
- Для serverless деплоя скопируйте `build/client/*`
- Для Express+adapter-node аналогично оригинальному проекту
