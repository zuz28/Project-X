// Helmet Management Service
// Tracks helmet information, lifecycle, and usage statistics.
// Paired helmets are persisted in AsyncStorage so they survive app restarts.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

export interface Helmet {
  id: string;
  deviceId: string; // BLE device ID
  name: string;
  model: string;
  serialNumber: string;
  pairedDate: number;
  firmwareVersion: string;
  batteryLevel: number;
  lastSeen: number;
  totalImpacts: number;
  status: 'active' | 'inactive' | 'disconnected';
}

const HELMETS_KEY = '@vela_helmets';

class HelmetService {
  private helmets: Map<string, Helmet> = new Map();
  private statusChecks: Map<string, ReturnType<typeof setInterval>> = new Map();
  private loaded = false;

  // Load persisted helmets into memory. Safe to call repeatedly.
  async ensureLoaded(): Promise<void> {
    if (this.loaded) return;
    try {
      const raw = await AsyncStorage.getItem(HELMETS_KEY);
      if (raw) {
        const list: Helmet[] = JSON.parse(raw);
        list.forEach((helmet) => {
          // Connections never survive a restart
          if (helmet.status === 'active') {
            helmet.status = 'inactive';
          }
          this.helmets.set(helmet.id, helmet);
        });
      }
    } catch (error) {
      logger.error('Failed to load helmets', error, 'HELMET');
    }
    this.loaded = true;
  }

  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        HELMETS_KEY,
        JSON.stringify(Array.from(this.helmets.values()))
      );
    } catch (error) {
      logger.error('Failed to save helmets', error, 'HELMET');
    }
  }

  // Pair new helmet
  async pairHelmet(
    deviceId: string,
    name: string,
    model: string,
    serialNumber: string
  ): Promise<Helmet> {
    await this.ensureLoaded();

    const helmet: Helmet = {
      id: `helmet-${Date.now()}`,
      deviceId,
      name,
      model,
      serialNumber,
      pairedDate: Date.now(),
      firmwareVersion: '2.1.0',
      batteryLevel: 100,
      lastSeen: Date.now(),
      totalImpacts: 0,
      status: 'active',
    };

    this.helmets.set(helmet.id, helmet);
    this.startStatusMonitoring(helmet.id);
    await this.persist();

    return helmet;
  }

  // Get helmet by ID
  getHelmet(helmetId: string): Helmet | null {
    return this.helmets.get(helmetId) || null;
  }

  // Get all helmets
  getAllHelmets(): Helmet[] {
    return Array.from(this.helmets.values());
  }

  // Update helmet battery
  updateBatteryLevel(helmetId: string, level: number): void {
    const helmet = this.helmets.get(helmetId);
    if (helmet) {
      helmet.batteryLevel = Math.max(0, Math.min(100, level));
      helmet.lastSeen = Date.now();
      this.persist();
    }
  }

  // Update helmet status
  updateStatus(helmetId: string, status: 'active' | 'inactive' | 'disconnected'): void {
    const helmet = this.helmets.get(helmetId);
    if (helmet) {
      helmet.status = status;
      helmet.lastSeen = Date.now();
      this.persist();
    }
  }

  // Record impact on helmet
  recordImpact(helmetId: string): void {
    const helmet = this.helmets.get(helmetId);
    if (helmet) {
      helmet.totalImpacts += 1;
      helmet.lastSeen = Date.now();
      this.persist();
    }
  }

  // Unpair helmet
  async unpairHelmet(helmetId: string): Promise<void> {
    const statusCheck = this.statusChecks.get(helmetId);
    if (statusCheck) {
      clearInterval(statusCheck);
      this.statusChecks.delete(helmetId);
    }
    this.helmets.delete(helmetId);
    await this.persist();
  }

  // Start monitoring helmet status
  private startStatusMonitoring(helmetId: string): void {
    // Simulate battery drain and status updates
    const interval = setInterval(() => {
      const helmet = this.helmets.get(helmetId);
      if (helmet) {
        // Simulate battery drain (0.5% per check)
        helmet.batteryLevel = Math.max(0, helmet.batteryLevel - 0.5);

        // Mark as disconnected if battery too low
        if (helmet.batteryLevel < 5 && helmet.status === 'active') {
          helmet.status = 'inactive';
        }
      }
    }, 60000); // Check every minute

    this.statusChecks.set(helmetId, interval);
  }

  // Get helmet health status
  getHelmetHealth(helmetId: string): {
    overall: 'excellent' | 'good' | 'fair' | 'poor';
    battery: string;
    connection: string;
    recommendation: string;
  } | null {
    const helmet = this.helmets.get(helmetId);
    if (!helmet) return null;

    // Grade from best to worst; each issue can only lower the grade.
    let overall: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
    const issues: string[] = [];

    if (helmet.status !== 'active') {
      issues.push('Not connected');
      overall = 'good';
    }
    if (helmet.batteryLevel < 20) {
      issues.push('Low battery');
      overall = 'fair';
    }
    if (helmet.batteryLevel < 5) {
      issues.push('Critical battery');
      overall = 'poor';
    }

    return {
      overall,
      battery: `${helmet.batteryLevel.toFixed(1)}%`,
      connection: helmet.status === 'active' ? 'Connected' : 'Disconnected',
      recommendation: issues.length > 0
        ? `Issues: ${issues.join(', ')}`
        : 'All systems normal',
    };
  }
}

export const helmetService = new HelmetService();
