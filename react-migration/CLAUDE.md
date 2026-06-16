# CLAUDE.md

Этот файл предоставляет руководство для Claude Code (claude.ai/code) при работе с кодом в этом репозитории.

## Обзор проекта

SmartHat — это **SvelteKit-приложение PWA** (прогрессивное веб-приложение) для Bluetooth Low Energy (BLE) связи со светодиодными матричными дисплеями. Приложение подключается к устройствам на базе ESP32 через BLE и управляет различными визуальными эффектами.

**Ключевые технологии:**
- Svelte 3 + SvelteKit (adapter-node для серверессного деплоя)
- TypeScript в строгом режиме
- PWA с WorkBox service worker
- Bluetooth Web API (navigator.bluetooth)
- Express.js хендлер бэкенда

## Архитектура

### Основные модули

#### Bluetooth Terminal (`src/lib/BluetoothTerminal.ts`)
Класс для управления BLE-соединениями по протоколу GATT:
- Подключается к ESP32-устройствам с использованием service UUID `0xFFE0` и characteristic UUID `0xFFE1`
- Обрабатывает уведомления для входящих данных от устройства
- Кэширует и парсит команды (разделитель — новая строка)
- Разбивает большие записи на части (максимум 40 байт за раз)

#### Управление хранилищем (`src/lib/stores.ts`)
Svelte stores для реактивного состояния:
- `deviceName`: Имя текущего подключённого Bluetooth-устройства
- `bridgest`: Уровень контраста LCD дисплея Bridgest M (2-255, по умолчанию 100)
- `mode`: Выбор визуального режима (Text/Matrix/Equalizer)
- `amplitude`: Яркость эффекта (по умолчанию 60%)
- `buttonCounter`: Счётчик нажатий кнопки для паттернов
- `autoChangePatterns`: Переключатель автопереключения паттернов

#### Протокол команд (`src/lib/commonData.ts`)
Команды протокола для связи с устройством:
```javascript
// Запрос полной конфигурации
GetConfig = '&!'

// Команды
Bridgest = '^' + value          // Установить контраст
ChangeMod = '$' + modeNumber    // Изменить визуальный режим
Amplitude = '@' + value         // Установить яркость
GetButtonCounter = '?'           // Запросить состояние кнопки
AutoChangePatterns = '!' + 0/1  // Переключить авто-паттерн
```

#### Структура маршрутов (`src/routes/`)
- `+page.svelte` (index): Главная страница с выбором эффектов
- `+page.svelte` (text): Режим текстового дисплея
- `+page.svelte` (equalizer): Визуализатор аудиоэквалайзера
- `+page.svelte` (terminal): Консольный терминал для сырых команд
- `/todos/`: Интеграция с внешним приложением задач

#### Шапка макета (`src/lib/header/Header.svelte`)
Управление Bluetooth-соединением:
- Кнопки подключения/отключения со иконками Bluetooth
- Отображает имя подключённого устройства
- Автоматическая загрузка конфигурации при подключении (`$&!`)
- Переход на страницы режимов через входящие команды `$mode`

### Service Worker & PWA
Конфигурация в `svelte.config.js`:
- `vite-plugin-pwa` создаёт service worker и манифест
- Источник: `./build/`, Выход: `./.svelte-kit/output/client/`
- Стратегия кэширования: Network-first для ресурсов, stale-while-revalidate для навигации
- Игнорирует URL-параметры (utm_, fbclid)
- Иконки манифеста: 192x192, 512x512 (png)

## Команды разработки

```bash
# Сервер разработки (hot reload)
npm run dev

# Сборка production (включает генерацию PWA)
npm run build

# Предпросмотр сборки production локально
npm run preview

# Тесты (Playwright E2E тесты)
npm test

# Проверка типов TypeScript
npm run check

# Лinting и форматирование
npm run lint      # Проверка через ESLint + Prettier
npm run format    # Автоматическое исправление через Prettier

# Генерация/обновление service worker
npm run generateSW
```

## Поток данных

1. **Действие пользователя** → Изменения в UI (выбор эффекта, настройка яркости)
2. **Состояние UI** → Обновление Svelte stores (`bridgest`, `mode` и др.)
3. **Изменения хранилища** → Header's `$page.url.pathname` запускает переход по маршруту если нужно
4. **Bluetooth Terminal** → Кодирование команд и отправка устройству через GATT write
5. **Ответ устройства** → Входящие данные парсятся в `bluetoothTerminal.receive()`
6. **Парсинг команд** → Switch statement dispatch к state setters

## Особые замечания

### Конфигурация UUID
Bluetooth Terminal принимает service/characteristic UUID как аргументы конструктора или через set/get методы:
- По умолчанию service: `0xFFE0` (GATT generic attribute profile)
- По умолчанию characteristic: `0xFFE1` (GATT client characteristic configuration descriptor)
- Альтернативный service для Matrix: `888159bd-8a02-42bf-86ef-bff8ffef0cd9`

### Фильтрация устройств
При запросе устройства фильтруется по имени ('SmartHat', 'SmartMatrix') с опциональным списком сервисов.

### Сводка команд режимов
```
'0' = Text mode        (переходит на /text)
'1' = Equalizer mode   (переходит на /equalizer)  
'2' = Snow pattern     (Снег)
'3' = Bouncing ball    (Мячик скачет из угла в угол)
'4' = 3 bouncing balls (3 маленьких шарика скачут)
'5' = Rainbow          (Радуга)
'6' = Diagonal rainbow (Радуга по диагонали)
'7' = Fire             (Огонь)
'8' = Matrix effect    (Матрица)
'9' = Star shower      (Звездопад)
'10' = Fireflies       (Огоньки)
```

### Команды для слоя эффектов
```\`{value}``` — наложение эффектов:
- `'0'` = Нет эффекта
- `'1'` = Эффект дыхания (изменяющаяся яркость со временем)
- `'2'` = Режим цветной модуляции
- `'3'` = Режим радуги

## Структура сборки

После `npm run build`:
```
build/
  client/        # Клиентский bundle + service worker + manifest
    _app/        # Структура приложения SvelteKit
    sw.js        # Service worker
    manifest.webmanifest  # PWA манифест
  server/        # Серверless function bundles
  handler.js     # Express middleware хендлер (используется в server.js)
```

## Замечания об окружении

- Файлы `.env` игнорируются git
- Использует `@lukeed/uuid` для генерации user ID при первом визите
- Cookie-based аутентификация хранит user ID в httpOnly cookie
- Express адаптер работает на порту 8080 по умолчанию

## Определения типов

`src/app.d.ts` расширяет типы SvelteKit:
```typescript
interface Locals { userid: string }
```

Хук `handle` генерирует уникальный userid и устанавливает его через cookie при первом визите.

## Тестирование

Playwright E2E тесты в директории `tests/` выполняются против preview-сервера (порт 3000). Тесты проверяют функциональность PWA, поток подключения Bluetooth и переключение эффектов.
