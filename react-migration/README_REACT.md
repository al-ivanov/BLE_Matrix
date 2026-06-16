# BLE Matrix - React Migration

## Обзор

Прогрессивное веб-приложение (PWA) для управления Bluetooth LED матричными дисплеями, переписанное с SvelteKit на React + Vite.

## Текущий статус миграции

### ✅ Завершено: Этап 0 - Подготовка
- [x] Анализ оригинального проекта SvelteKit
- [x] Создание Vite + React проекта (TypeScript)
- [x] Установка зависимостей
- [x] Настройка Tailwind CSS

### 🚧 В процессе: Этап 1 - Базовая структура
- [x] **BluetoothContext** — контекстный провайдер для управления состоянием
- [x] **BluetoothTerminal** — класс BLE связи (перенесён из оригинального проекта)
- [x] **BluetoothHeader** — компонент шапки с подключением/отключением
- [ ] Перенос страниц маршрутов

## Структура проекта

```
react-migration/
├── context/                 # React Context для состояния Bluetooth
│   └── BluetoothContext.tsx
├── src/
│   ├── components/
│   │   ├── BluetoothHeader.tsx   # Шапка с кнопками подключения
│   │   └── Footer.tsx            # Футер приложения
│   ├── pages/                    # Страницы (React Router)
│   │   ├── About.tsx
│   │   ├── Equalizer.tsx
│   │   ├── Home.tsx              # Главная страница с выбором эффектов
│   │   ├── Terminal.tsx
│   │   └── TextMode.tsx
│   ├── App.tsx                   # Главный layout
│   └── main.tsx                  # Entry point
├── utils/
│   ├── bluetooth-terminal.ts     # Класс BLE (из оригинального проекта)
│   └── commands.ts               # Протокол команд
├── types/
│   └── bluetooth-terminal.d.ts   # TypeScript типы
├── tailwind.config.js            # Конфигурация Tailwind
├── vite.config.ts                # Vite конфигурация + PWA
├── tsconfig*.json                # TypeScript конфиги
└── index.html                    # HTML template
```

## Ключевые компоненты миграции

### 1. BluetoothContext (`context/BluetoothContext.tsx`)

Замена Svelte stores на React Context API:

```typescript
interface BluetoothState {
  deviceName: string;      // Имя устройства (kepi)
  isConnected: boolean;     // Статус подключения
  config?: any;            // Конфигурация устройства
}
```

### 2. BluetoothTerminal (`utils/bluetooth-terminal.ts`)

Класс для управления BLE-соединением, **перенесён из оригинального проекта**:

- Подключение к устройству через GATT (UUID: `0xFFE0` / `0xFFE1`)
- Обработка уведомлений и входящих команд
- Автоматическая загрузка конфигурации при подключении (`$&!`)
- Парсинг команд: `$` (режим), `@` (яркость), `^` (контраст)

### 3. BluetoothHeader (`src/components/BluetoothHeader.tsx`)

Компонент управления соединением:

- Кнопки **Connect** / **Disconnect**
- Отображение статуса подключения
- Автоматический переход на страницы режимов по командам устройства

## Запуск проекта

```bash
cd react-migration

# Разработка с hot reload
npm run dev

# Production сборка
npm run build

# Предпросмотр сборки
npm run preview
```

## Команды протокола

| Команда | Кодирование | Описание |
|---------|-------------|----------|
| GetConfig | `&!` | Запрос полной конфигурации |
| ChangeMod | `$0-10` | Выбор визуального режима (0-10) |
| Amplitude | `@value` | Установка яркости (0-255) |
| Bridgest | `^value` | Установить контраст LCD (2-255) |
| GetButtonCounter | `?` | Запрос состояния кнопки |
| AutoChangePatterns | `!0/1` | Переключить авто-паттерн |

### Режимы визуализации

| Код | Название | Описание |
|-----|----------|----------|
| 0 | Text Mode | Бегущая строка текста |
| 1 | Equalizer | Аудио эквалайзер |
| 2 | Snow | Эффект снега |
| 3 | Bouncing Ball | Скачущий мячик |
| 4 | 3 Balls | 3 скачающих шарика |
| 5-9 | Rainbow, Fire, Matrix и др. | Дополнительные эффекты |

## Миграция компонентов

### СvelteKit → React Router

**Svelte:**
```svelte
<script>
  let { data } = await fetch('/api/data');
</script>
```

**React:**
```tsx
import { useEffect, useState } from 'react';

function Component() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData().then(setData);
  }, []);
}
```

### Svelte Stores → React Context

**Svelte:**
```svelte
<script>
  import { deviceName } from '$lib/stores';
</script>
```

**React:**
```tsx
import { useBluetooth } from '../context/BluetoothContext';
function Component() {
  const { deviceName, connect, disconnect } = useBluetooth();
}
```

## Дальнейшая миграция

### Следующие шаги:

1. **Home.tsx** — Главная страница с выбором эффектов
2. **TextMode.tsx** — Режим текстового дисплея (форма ввода текста)
3. **Equalizer.tsx** — Эквалайзер (6 типов + настройки чувствительности)
4. **Terminal.tsx** — Консольный терминал для сырых команд
5. **PWA конфигурация** — Настройка service worker в `vite.config.ts`

### Периоды эффектов (слой визуализации):

- `0` = No effect
- `1` = Breathing effect (изменяющаяся яркость)
- `2` = Color modulation mode
- `3` = Rainbow mode

## Примечания

- Оригинал проекта использует Svelte 3 + adapter-node для серверного деплоя
- React версия — client-side только, но с аналогичной функциональностью
- Все Bluetooth команды и протокол сохранены без изменений
- PWA функциональность (offline, service worker) поддерживается через Vite plugin
