import { BleManager, Device } from 'react-native-ble-plx';
import type { Impact } from './mockImpacts';

const manager = new BleManager();

// These UUIDs should match your helmet firmware spec
const HELMET_SERVICE_UUID = '12345678-1234-5678-1234-567812345678';
const IMPACT_CHARACTERISTIC_UUID = '87654321-4321-8765-4321-876543218765';

export interface BluetoothState {
  isScanning: boolean;
  isConnected: boolean;
  device: Device | null;
  lastImpact: Impact | null;
}

export class HelmetBLE {
  private device: Device | null = null;
  private onImpact: ((impact: Impact) => void) | null = null;

  async startScan(): Promise<Device[]> {
    const discovered: Device[] = [];

    return new Promise((resolve, reject) => {
      manager.startDeviceScan([HELMET_SERVICE_UUID], null, (error, device) => {
        if (error) {
          reject(error);
          return;
        }

        if (device?.isConnectable) {
          const exists = discovered.find(d => d.id === device.id);
          if (!exists) {
            discovered.push(device);
          }
        }
      });

      setTimeout(() => {
        manager.stopDeviceScan();
        resolve(discovered);
      }, 10000);
    });
  }

  async connect(device: Device): Promise<void> {
    try {
      const connected = await device.connect();
      this.device = connected;

      await connected.discoverAllServicesAndCharacteristics();
      await this.subscribeToImpacts();
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  }

  private async subscribeToImpacts(): Promise<void> {
    if (!this.device) return;

    try {
      this.device.monitorCharacteristicForService(
        HELMET_SERVICE_UUID,
        IMPACT_CHARACTERISTIC_UUID,
        (error, char) => {
          if (error) {
            console.error('Monitor error:', error);
            return;
          }

          if (char?.value) {
            const impact = this.decodeImpact(Buffer.from(char.value, 'base64'));
            if (this.onImpact) {
              this.onImpact(impact);
            }
          }
        }
      );
    } catch (error) {
      console.error('Subscribe error:', error);
    }
  }

  private decodeImpact(buffer: Buffer): Impact {
    // Decode based on your helmet firmware format
    // This is a sample implementation - adjust based on actual protocol
    const gForce = buffer.readFloatBE(0);
    const rotational = buffer.readUInt32BE(4);
    const flags = buffer.readUInt8(8);

    return {
      id: `impact-${Date.now()}`,
      timestamp: Date.now(),
      gForce: parseFloat(gForce.toFixed(1)),
      rotational,
      flagged: (flags & 0x01) !== 0,
    };
  }

  onImpactReceived(callback: (impact: Impact) => void): void {
    this.onImpact = callback;
  }

  async disconnect(): Promise<void> {
    if (this.device) {
      try {
        await this.device.cancelConnection();
        this.device = null;
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    }
  }

  isConnected(): boolean {
    return this.device !== null;
  }
}

export const helmet = new HelmetBLE();
