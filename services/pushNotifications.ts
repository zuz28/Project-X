// Push notifications service (FCM / APNs)
// Handles real-time alerts for impacts and health recommendations

import { Platform } from 'react-native';
import { logger } from '../utils/logger';

export interface NotificationPermission {
  granted: boolean;
  status: 'granted' | 'denied' | 'not_determined';
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  timestamp: number;
}

export interface PushNotificationListener {
  (notification: PushNotification): void;
}

class PushNotificationService {
  private deviceToken: string | null = null;
  private isInitialized = false;
  private listeners: PushNotificationListener[] = [];
  private permissions: NotificationPermission = {
    granted: false,
    status: 'not_determined',
  };

  async initialize(): Promise<void> {
    try {
      // In production, use:
      // - expo-notifications for Expo
      // - react-native-firebase for FCM (Android)
      // - react-native-push-notification for APNs

      logger.info('Push notifications initialized', {}, 'PUSH');
      this.isInitialized = true;

      // Set up listeners
      this.setupListeners();
    } catch (error) {
      logger.error('Failed to initialize push notifications', error, 'PUSH');
    }
  }

  private setupListeners(): void {
    // In production:
    // - Listen for foreground notifications
    // - Listen for background notification taps
    // - Listen for permission changes
  }

  async requestPermissions(): Promise<NotificationPermission> {
    try {
      if (Platform.OS === 'web') {
        this.permissions = { granted: false, status: 'denied' };
        return this.permissions;
      }

      // In production: Use Notifications.requestPermissionsAsync()
      // or specific Firebase/APNs permission APIs

      this.permissions = { granted: true, status: 'granted' };
      logger.info('Push notification permissions granted', {}, 'PUSH');
      return this.permissions;
    } catch (error) {
      logger.error('Failed to request notification permissions', error, 'PUSH');
      this.permissions = { granted: false, status: 'denied' };
      return this.permissions;
    }
  }

  async getDeviceToken(): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (this.deviceToken) {
        return this.deviceToken;
      }

      // In production: Get token from Firebase or APNs
      // const token = await messaging().getToken();
      // or
      // const token = await Notifications.getExpoPushTokenAsync();

      logger.debug('Device token retrieved', { token: this.deviceToken?.substring(0, 20) }, 'PUSH');
      return this.deviceToken;
    } catch (error) {
      logger.error('Failed to get device token', error, 'PUSH');
      return null;
    }
  }

  registerListener(listener: PushNotificationListener): () => void {
    this.listeners.push(listener);

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(notification: PushNotification): void {
    this.listeners.forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        logger.error('Push notification listener error', error, 'PUSH');
      }
    });
  }

  async sendLocalNotification(notification: Omit<PushNotification, 'id' | 'timestamp'>): Promise<void> {
    try {
      const localNotification: PushNotification = {
        ...notification,
        id: `local_${Date.now()}`,
        timestamp: Date.now(),
      };

      // In production: Use Notifications.scheduleNotificationAsync()
      // notification.data is automatically handled by the system

      this.notifyListeners(localNotification);
      logger.info('Local notification sent', { title: notification.title }, 'PUSH');
    } catch (error) {
      logger.error('Failed to send local notification', error, 'PUSH');
    }
  }

  async sendTestNotification(): Promise<void> {
    await this.sendLocalNotification({
      title: 'Vela Test Alert',
      body: 'This is a test notification to verify push notifications are working.',
      data: { type: 'test' },
    });
  }

  getPermissionStatus(): NotificationPermission {
    return this.permissions;
  }

  isInitialized(): boolean {
    return this.isInitialized;
  }
}

export const pushNotificationService = new PushNotificationService();
