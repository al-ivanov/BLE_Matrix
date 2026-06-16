// Type definitions for Bluetooth Terminal interface

export interface BluetoothTerminal {
  connect(): Promise<any>;
  disconnect(): void;
  send(data: string): Promise<void>;
  receive?(data: string): void;
  getDeviceName(): string;
}
