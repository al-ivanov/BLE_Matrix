# BLE Matrix

PWA-приложение для управления LED-кепкой **SmartHat** / **SmartMatrix** по Web Bluetooth.

Стек: **React 19**, **Vite**, **TypeScript**, **Tailwind CSS**, **React Router**, **vite-plugin-pwa**.

## Возможности

- Подключение к устройству по Bluetooth
- Режимы и эффекты LED
- Бегущая строка
- Эквалайзер
- Отладочный терминал BLE

## Требования

- Node.js 20+
- Chrome или Edge (Web Bluetooth API)
- HTTPS или `localhost` для BLE

## Разработка

```bash
cd frontend
npm install
npm run dev
```

Откройте http://localhost:5173

## Сборка

```bash
# Локальный сервер / self-hosted (base: /)
npm run build

# GitHub Pages (base: /BLE_Matrix/)
npm run build:pages
```

## Production-сервер (Express + PM2)

```bash
npm run build
npm start          # порт 8080
# или
pm2 restart server
```

## GitHub Pages

Сайт: **https://al-ivanov.github.io/BLE_Matrix/**

Деплой автоматический при push в `master` (workflow `.github/workflows/deploy-pages.yml`).

В настройках репозитория: **Settings → Pages → Build and deployment → GitHub Actions**.

Локальная проверка сборки для Pages:

```bash
npm run build:pages
npm run preview:pages
# http://localhost:4173/BLE_Matrix/
```

## Структура проекта

```
frontend/          React-приложение
firmware-esp32/    Прошивка ESP32
server.js            Express для self-hosted
docs/                Документация миграции
```

## Прошивка

См. `firmware-esp32/SmartHatEqulizer/`.
