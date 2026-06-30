import { BleManager, Device } from 'react-native-ble-plx';
import type { Impact } from './mockImpacts';
import { logger } from '../utils/logger';
import { validateImpact, sanitizeImpact } from '../utils/validation';

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
    logger.debug('BLE', 'Starting device scan');

    return new Promise((resolve, reject) => {
      manager.startDeviceScan([HELMET_SERVICE_UUID], null, (error, device) => {
        if (error) {
          logger.error('BLE', 'Scan error', error);
          reject(error);
          return;
        }

        if (device?.isConnectable) {
          const exists = discovered.find(d => d.id === device.id);
          if (!exists) {
            logger.debug('BLE', `Found device: ${device.name || device.id}`);
            discovered.push(device);
          }
        }
      });

      setTimeout(() => {
        manager.stopDeviceScan();
        logger.info('BLE', `Scan complete. Found ${discovered.length} devices`);
        resolve(discovered);
      }, 10000);
    });
  }

  async connect(device: Device): Promise<void> {
    try {
      logger.info('BLE', `Connecting to ${device.name || device.id}`);
      const connected = await device.connect();
      this.device = connected;

      logger.debug('BLE', 'Discovering services and characteristics');
      await connected.discoverAllServicesAndCharacteristics();
      await this.subscribeToImpacts();
      logger.info('BLE', 'Connection established and subscribed');
    } catch (error) {
      logger.error('BLE', 'Connection failed', error);
      throw error;
    }
  }

  private async subscribeToImpacts(): Promise<void> {
    if (!this.device) return;

    try {
      logger.debug('BLE', 'Subscribing to impact characteristic');
      this.device.monitorCharacteristicForService(
        HELMET_SERVICE_UUID,
        IMPACT_CHARACTERISTIC_UUID,
        (error, char) => {
          if (error) {
            logger.error('BLE', 'Monitor error', error);
            return;
          }

          if (char?.value) {
            try {
              const impact = this.decodeImpact(Buffer.from(char.value, 'base64'));
              if (validateImpact(impact)) {
                const sanitized = sanitizeImpact(impact) as Impact;
                logger.debug('BLE', `Received impact: ${sanitized.gForce}G`);
                if (this.onImpact) {
                  this.onImpact(sanitized);
                }
              } else {
                logger.warn('BLE', 'Invalid impact data received');
              }
            } catch (decodeError) {
              logger.error('BLE', 'Failed to decode impact', decodeError);
            }
          }
        }
      );
    } catch (error) {
      logger.error('BLE', 'Subscribe error', error);
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
        logger.info('BLE', 'Disconnecting');
        await this.device.cancelConnection();
        this.device = null;
        logger.info('BLE', 'Disconnected');
      } catch (error) {
        logger.error('BLE', 'Disconnect error', error);
      }
    }
  }

  isConnected(): boolean {
    return this.device !== null;
  }
}

export const helmet = new HelmetBLE();
