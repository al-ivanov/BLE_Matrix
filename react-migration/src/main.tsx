import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

const bluetoothTerminal: any = null // Will be initialized via Context

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BluetoothProvider bluetoothTerminal={bluetoothTerminal}>
      <App />
    </BluetoothProvider>
  </React.StrictMode>,
)
