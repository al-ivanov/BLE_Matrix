import React from 'react';
import { useBluetooth } from '../context/BluetoothContext';

export interface BluetoothHeaderProps {}

export default function BluetoothHeader() {
  const { isConnected, connect, disconnect, deviceName } = useBluetooth();

  return (
    <header className="bg-cyan-900 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isConnected ? (
            <>
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17m2-4a2 2 0 010 4m2-4a2 2 0 010 4m2-4a2 2 0 010 4m2-4a2 2 0 010 4"
                />
              </svg>
              <div className="flex flex-col">
                <span className="font-bold text-sm truncate max-w-[120px]">
                  {deviceName}
                </span>
                <span className="text-xs text-green-300">Подключено</span>
              </div>
            </>
          ) : (
            <>
              <svg
                className="w-8 h-8 text-cyan-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 6.964a9 9 0 111.414 3.829"
                />
              </svg>
              <div className="flex flex-col">
                <span className="font-bold text-sm truncate max-w-[120px]">
                  {deviceName}
                </span>
                <span className="text-xs text-cyan-300">Не подключено</span>
              </div>
            </>
          )}
        </div>

        <div className="flex space-x-2">
          {!isConnected ? (
            <button
              onClick={connect}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-full flex items-center space-x-2 text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18.364 5.636a9 9 0 00-12.728 0L2.426 9.894c-.392.392-.392 1.03 0 1.422l4.268 4.268a9 9 0 0012.728-12.728L18.364 5.636zM14.32 9.571a.75.75 0 01-.954.954l-.75-.75H9.495l-1.93 1.93a.75.75 0 11-1.062-1.062l2.25-2.25L8.25 4.25a.75.75 0 011.414-.213l3.73 3.536z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Connect</span>
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-full flex items-center space-x-2 text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Disconnect</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
