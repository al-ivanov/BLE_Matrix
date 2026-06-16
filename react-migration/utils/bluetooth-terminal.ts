/**
 * TypeScript definitions for Bluetooth Terminal interface.
 * The actual implementation can be in a separate package or kept from the original project.
 */

export interface BluetoothTerminal {
  connect(): Promise<any>;
  disconnect(): void;
  send(data: string): Promise<void>;
  receive?(data: string): void;
  getDeviceName(): string;
}

// Placeholder implementation - use actual BluetoothTerminal from original project
export const createBluetoothTerminal = (): BluetoothTerminal => {
  // Import or instantiate the real BluetoothTerminal class here
  console.log('Using placeholder Bluetooth terminal');
  
  return {
    connect: async () => {
      console.log('Bluetooth connecting...');
    },
    disconnect: () => {
      console.log('Bluetooth disconnected');
    },
    send: async (data: string) => {
      console.log('Sending:', data);
    },
    getDeviceName: () => ''
  };
};
