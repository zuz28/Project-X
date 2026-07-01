// Helmet Management Service
// Tracks helmet information, lifecycle, and usage statistics

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

class HelmetService {
  private helmets: Map<string, Helmet> = new Map();
  private statusChecks: Map<string, NodeJS.Timeout> = new Map();

  // Pair new helmet
  async pairHelmet(
    deviceId: string,
    name: string,
    model: string,
    serialNumber: string
  ): Promise<Helmet> {
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
    }
  }

  // Update helmet status
  updateStatus(helmetId: string, status: 'active' | 'inactive' | 'disconnected'): void {
    const helmet = this.helmets.get(helmetId);
    if (helmet) {
      helmet.status = status;
      helmet.lastSeen = Date.now();
    }
  }

  // Record impact on helmet
  recordImpact(helmetId: string): void {
    const helmet = this.helmets.get(helmetId);
    if (helmet) {
      helmet.totalImpacts += 1;
      helmet.lastSeen = Date.now();
    }
  }

  // Unpair helmet
  unpairHelmet(helmetId: string): void {
    const statusCheck = this.statusChecks.get(helmetId);
    if (statusCheck) {
      clearInterval(statusCheck);
      this.statusChecks.delete(helmetId);
    }
    this.helmets.delete(helmetId);
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

    let overall: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
    const issues: string[] = [];

    if (helmet.batteryLevel < 20) {
      issues.push('Low battery');
      overall = 'fair';
    }
    if (helmet.batteryLevel < 5) {
      issues.push('Critical battery');
      overall = 'poor';
    }
    if (helmet.status !== 'active') {
      issues.push('Not connected');
      overall = overall === 'excellent' ? 'good' : overall;
    }

    if (issues.length > 0) {
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
