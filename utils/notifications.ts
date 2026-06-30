import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Impact } from '../services/mockImpacts';
import { calculateConcussionRisk } from './validation';

export interface Notification {
  id: string;
  type: 'impact' | 'connection' | 'warning';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: Record<string, any>;
}

const NOTIFICATIONS_KEY = '@vela_notifications';
const MAX_STORED_NOTIFICATIONS = 100;

export class NotificationManager {
  private listeners: ((notifications: Notification[]) => void)[] = [];

  async addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}`,
        timestamp: Date.now(),
        read: false,
      };

      notifications.unshift(newNotification);

      // Keep only the latest notifications
      if (notifications.length > MAX_STORED_NOTIFICATIONS) {
        notifications.splice(MAX_STORED_NOTIFICATIONS);
      }

      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
      this.notifyListeners(notifications);
    } catch (error) {
      console.error('Failed to add notification:', error);
    }
  }

  async getNotifications(): Promise<Notification[]> {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  async markAsRead(id: string): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const index = notifications.findIndex(n => n.id === id);

      if (index !== -1) {
        notifications[index].read = true;
        await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
        this.notifyListeners(notifications);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async clearNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
      this.notifyListeners([]);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }

  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(notifications: Notification[]): void {
    this.listeners.forEach(listener => listener(notifications));
  }
}

export const notificationManager = new NotificationManager();

export async function notifyHighImpact(impact: Impact): Promise<void> {
  const { risk, reasons } = calculateConcussionRisk(impact);

  if (impact.flagged) {
    await notificationManager.addNotification({
      type: 'warning',
      title: 'High Impact Detected',
      message: `Impact of ${impact.gForce}G detected. ${reasons[0]}`,
      data: {
        impactId: impact.id,
        gForce: impact.gForce,
        risk,
      },
    });
  }
}

export async function notifyConnectionChange(connected: boolean): Promise<void> {
  await notificationManager.addNotification({
    type: 'connection',
    title: connected ? 'Helmet Connected' : 'Helmet Disconnected',
    message: connected
      ? 'Your helmet is now connected and streaming data'
      : 'Connection to helmet was lost',
    data: {
      connected,
    },
  });
}
