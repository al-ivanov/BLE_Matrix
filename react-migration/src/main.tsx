import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import BluetoothTerminal from '../utils/bluetooth-terminal';

const bluetoothTerminal = new BluetoothTerminal();

// Инициализация BluetoothTerminal при загрузке приложения
console.log('Initializing BLE Matrix React Application...');
console.log('BluetoothTerminal instance created');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App bluetoothTerminal={bluetoothTerminal as any} />
  </React.StrictMode>
);
