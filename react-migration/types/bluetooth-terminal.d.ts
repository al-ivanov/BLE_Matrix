// TypeScript типы для BluetoothTerminal класса (из оригинального SvelteKit проекта)

export interface BluetoothTerminal {
  connect(deviceName?: string, listOfServices?: Array<{ uuid: string; id?: number }>): Promise<void>;
  disconnect(): Promise<void>;
  send(data: string | ArrayBuffer): Promise<void>;
  setServiceUUID(serviceUUID: string): void;
  setCharacteristicUUID(characteristicUUID: string): void;
  getServiceUUID(): string;
  getCharacteristicUUID(): string;
}

export interface GATTDescriptor {
  value?: DataView;
  characteristics: Array<{ uuid: string }>;
}

export interface Characteristic {
  descriptors: GATTDescriptor[];
  handle: number;
  permissions: number;
  properties: string;
  service: Service;
  uuid: string;
  characteristicType?: 'device' | 'service' | 'descriptor';
}

export interface Service {
  id: number;
  permissions: number;
  maxAttributeValueLength?: number;
  uuid: string;
}
