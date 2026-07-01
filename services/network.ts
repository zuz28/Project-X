// Network status detection and connectivity management
import { Platform } from 'react-native';

type NetworkListener = (isOnline: boolean) => void;

class NetworkService {
  private listeners: NetworkListener[] = [];
  private isOnline: boolean = true;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeNetworkDetection();
  }

  private initializeNetworkDetection() {
    // In production, use @react-native-community/netinfo or expo-network
    // For now, simulate with periodic checks and assume online by default
    if (Platform.OS !== 'web') {
      this.startPeriodicCheck();
    }
  }

  private startPeriodicCheck() {
    // Check network status every 30 seconds
    this.checkInterval = setInterval(() => {
      this.checkConnectivity();
    }, 30000);
  }

  private async checkConnectivity() {
    try {
      // In production, use actual network check
      // const response = await fetch('https://api.example.com/health', { timeout: 5000 });
      // this.setOnline(response.ok);

      // For now, assume online if we can log
      this.setOnline(true);
    } catch (error) {
      this.setOnline(false);
    }
  }

  private setOnline(online: boolean) {
    if (this.isOnline !== online) {
      this.isOnline = online;
      this.notifyListeners();
    }
  }

  isConnected(): boolean {
    return this.isOnline;
  }

  onConnectionChange(listener: NetworkListener): () => void {
    this.listeners.push(listener);
    // Immediately call with current status
    listener(this.isOnline);

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.isOnline);
      } catch (error) {
        console.error('Network listener error:', error);
      }
    });
  }

  cleanup() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.listeners = [];
  }
}

export const networkService = new NetworkService();
