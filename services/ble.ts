import { NativeEventEmitter, Platform } from 'react-native';
import { logger } from '../utils/logger';

// BLE Service for Helmet Connectivity
// Manages device discovery, pairing, and real-time impact data streaming

export interface BluetoothDevice {
  id: string;
  name: string;
  rssi: number;
  isConnected: boolean;
}

export interface ImpactData {
  timestamp: number;
  gForce: number;
  rotational: number;
  x: number;
  y: number;
  z: number;
}

type BluetoothListener = (data: ImpactData) => void;

class BLEService {
  private listeners: BluetoothListener[] = [];
  private connectedDevice: BluetoothDevice | null = null;
  private isScanning = false;
  private mockDataInterval: NodeJS.Timeout | null = null;

  // Start scanning for nearby Bluetooth devices
  async startScanning(): Promise<void> {
    if (this.isScanning) return;
    this.isScanning = true;

    // In production, this would use:
    // - react-native-ble-plx for real BLE
    // - or expo-ble-upm for Expo-managed version

    // For now, simulate device discovery
    logger.info('Starting device scan', {}, 'BLE');
  }

  // Stop scanning
  async stopScanning(): Promise<void> {
    this.isScanning = false;
    logger.info('Stopped scanning', {}, 'BLE');
  }

  // Connect to a specific device
  async connectToDevice(deviceId: string, deviceName: string): Promise<void> {
    try {
      logger.info(`Connecting to ${deviceName}`, { deviceId }, 'BLE');

      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      this.connectedDevice = {
        id: deviceId,
        name: deviceName,
        rssi: -45,
        isConnected: true,
      };

      // Start listening for impact data
      this.startDataStream();

      logger.info(`Connected to ${deviceName}`, { deviceId }, 'BLE');
    } catch (error) {
      logger.error(`Connection failed to ${deviceName}`, error, 'BLE');
      throw error;
    }
  }

  // Disconnect from device
  async disconnectDevice(): Promise<void> {
    if (this.mockDataInterval) {
      clearInterval(this.mockDataInterval);
      this.mockDataInterval = null;
    }

    if (this.connectedDevice) {
      logger.info(`Disconnected from ${this.connectedDevice.name}`, {}, 'BLE');
      this.connectedDevice.isConnected = false;
      this.connectedDevice = null;
    }
  }

  // Start receiving impact data from helmet
  private startDataStream(): void {
    // Simulate real-time impact data from helmet sensors
    // In production, this would subscribe to BLE characteristics
    this.mockDataInterval = setInterval(() => {
      // Only generate impacts occasionally to simulate real usage
      if (Math.random() > 0.92) {
        const gForce = +(20 + Math.random() * 70).toFixed(1);
        const rotational = Math.round(1000 + Math.random() * 5000);

        const data: ImpactData = {
          timestamp: Date.now(),
          gForce,
          rotational,
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          z: (Math.random() - 0.5) * 100,
        };

        this.notifyListeners(data);
      }
    }, 500);
  }

  // Register listener for impact events
  onImpact(listener: BluetoothListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of new impact
  private notifyListeners(data: ImpactData): void {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        logger.error('Listener error', error, 'BLE');
      }
    });
  }

  // Get connected device info
  getConnectedDevice(): BluetoothDevice | null {
    return this.connectedDevice;
  }

  // Check if currently connected
  isConnected(): boolean {
    return this.connectedDevice?.isConnected ?? false;
  }

  // Get scanning status
  getIsScanning(): boolean {
    return this.isScanning;
  }
}

export const bleService = new BLEService();
