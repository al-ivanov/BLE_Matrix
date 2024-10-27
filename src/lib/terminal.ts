import { BluetoothTerminal } from "$lib/BluetoothTerminal";

const serviveUuid = 0xFFE0
const characteristicUuid = 0xFFE1

export const terminal = new BluetoothTerminal(serviveUuid,characteristicUuid, '\n','\n');