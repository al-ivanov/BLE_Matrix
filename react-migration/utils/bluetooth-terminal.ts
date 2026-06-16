// Bluetooth Terminal класс для работы с BLE устройствами
// Копия из оригинального SvelteKit проекта (адаптирована для React)

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

class BluetoothTerminal {
  static readonly SERVICE_UUID_GENERIC = '0000ffe0-0000-1000-8000-00805f9b34fb';
  static readonly SERVICE_UUID_MATRIX = '888159bd-8a02-42bf-86ef-bff8ffef0cd9';

  private serviceUUID: string;
  private characteristicUUID: string;
  private deviceHandle?: BluetoothDevice;

  static readonly BREAKPOINT = 15;

  constructor(
    serviceUUID: string = BluetoothTerminal.SERVICE_UUID_GENERIC,
    characteristicUUID: string = '0000ffe1-0000-1000-8000-00805f9b34fb'
  ) {
    this.serviceUUID = serviceUUID;
    this.characteristicUUID = characteristicUUID;
  }

  getServiceUUID(): string {
    return this.serviceUUID;
  }

  getCharacteristicUUID(): string {
    return this.characteristicUUID;
  }

  setServiceUUID(serviceUUID: string) {
    this.serviceUUID = serviceUUID;
  }

  setCharacteristicUUID(characteristicUUID: string) {
    this.characteristicUUID = characteristicUUID;
  }

  async connect(
    deviceName?: string,
    listOfServices?: Array<{ uuid: string; id?: number }>
  ): Promise<void> {
    const deviceHandles = await navigator.bluetooth.requestDevice({
      filters: [{ nameStrings: deviceName ? [deviceName] : undefined }],
    });

    if (listOfServices) {
      this.serviceUUID = listOfServices[0].uuid;
    }

    console.log('Ожидание соединения...', this.serviceUUID);

    const server = await deviceHandles.gatt?.server();
    const service = await server?.getPrimaryService(this.serviceUUID);

    if (!service) {
      throw new Error('Сервис не найден');
    }

    console.log('Сервис найден', this.serviceUUID);

    const characteristic = await service.getCharacteristic(this.characteristicUUID);

    const descriptor = await characteristic.getDescriptor(
      '00002902-0000-1000-8000-00805f9b34fb'
    );

    if (!descriptor) {
      throw new Error('CCC Descriptor не найден');
    }

    console.log('Подписка на уведомления...');

    this.deviceHandle = deviceHandles;
  }

  getBluetoothDevice(): BluetoothDevice | undefined {
    return this.deviceHandle;
  }

  async send(
    data: DataView | Uint8Array,
    characteristicUUID?: string
  ): Promise<void> {
    const device = this.getBluetoothDevice();

    if (!device) {
      console.error('Нет активного Bluetooth соединения');
      return;
    }

    const server = await device.gatt?.server();

    if (!server) {
      console.error('GATT сервер не доступен');
      return;
    }

    const service = await server.getPrimaryService(this.serviceUUID);

    if (!service) {
      console.error('Сервис не найден для записи');
      return;
    }

    const characteristicUUIDToUse = characteristicUUID || this.characteristicUUID;
    const characteristic = await service.getCharacteristic(characteristicUUIDToUse);

    if (!characteristic) {
      console.error('Характеристика не найдена для записи');
      return;
    }

    console.log('Отправка данных...', characteristicUUIDToUse);

    try {
      await characteristic.writeValue(data);
    } catch (error) {
      console.error('Ошибка при отправке данных:', error);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.deviceHandle) return;

    try {
      const server = await this.deviceHandle.gatt?.server();

      if (server) {
        const serviceUUIDs = [
          this.serviceUUID,
          BluetoothTerminal.SERVICE_UUID_MATRIX,
        ];

        for (const uuid of serviceUUIDs) {
          try {
            const service = await server.getPrimaryService(uuid);

            if (service) {
              const characteristicUUIDs: string[] = [];

              if (uuid === this.serviceUUID) {
                characteristicUUIDs.push(this.characteristicUUID);
              }

              for (const charUUID of characteristicUUIDs) {
                try {
                  const characteristic = await service.getCharacteristic(charUUID);

                  if (characteristic) {
                    await characteristic.stopNotifications();
                    console.log('Уведомления остановлены для', charUUID);
                  }
                } catch (e) {
                  console.error('Ошибка остановки уведомлений:', e);
                }
              }

              await service.close();
            }
          } catch (e) {
            console.error(`Ошибка закрытия сервиса ${uuid}:`, e);
          }
        }
      }
    } catch (error) {
      console.error('Ошибка при отключении:', error);
    } finally {
      this.deviceHandle = undefined;
    }
  }
}

export default BluetoothTerminal;
