import { BluetoothTerminal } from '@/lib/BluetoothTerminal';

const serviceUuid = 0xffe0;
const characteristicUuid = 0xffe1;

export const terminal = new BluetoothTerminal(serviceUuid, characteristicUuid, '\n', '\n');
