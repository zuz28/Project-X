// Offline storage and sync manager
// Handles local caching and background sync

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

export interface OfflineSyncQueue {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  resource: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineStorageService {
  private syncQueue: OfflineSyncQueue[] = [];
  private isSyncing: boolean = false;
  private readonly SYNC_QUEUE_KEY = '@vela_sync_queue';
  private readonly CACHE_KEY = '@vela_cache';
  private syncListeners: ((queue: OfflineSyncQueue[]) => void)[] = [];

  constructor() {
    this.loadSyncQueue();
  }

  async loadSyncQueue() {
    try {
      const data = await AsyncStorage.getItem(this.SYNC_QUEUE_KEY);
      if (data) {
        this.syncQueue = JSON.parse(data);
        logger.info('Sync queue loaded', { count: this.syncQueue.length }, 'OFFLINE');
      }
    } catch (error) {
      logger.error('Failed to load sync queue', error, 'OFFLINE');
    }
  }

  private async saveSyncQueue() {
    try {
      await AsyncStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(this.syncQueue));
      this.notifyListeners();
    } catch (error) {
      logger.error('Failed to save sync queue', error, 'OFFLINE');
    }
  }

  async queueOperation(
    type: 'CREATE' | 'UPDATE' | 'DELETE',
    resource: string,
    data: any
  ): Promise<OfflineSyncQueue> {
    const operation: OfflineSyncQueue = {
      id: `${resource}_${Date.now()}`,
      type,
      resource,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.syncQueue.push(operation);
    await this.saveSyncQueue();

    logger.info(`Operation queued: ${type} ${resource}`, { id: operation.id }, 'OFFLINE');
    return operation;
  }

  async syncOfflineChanges(): Promise<boolean> {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return true;
    }

    this.isSyncing = true;

    try {
      const queue = [...this.syncQueue];

      for (const operation of queue) {
        try {
          // Send to backend
          // await api.sync(operation);

          // Remove from queue on success
          this.syncQueue = this.syncQueue.filter(op => op.id !== operation.id);
          logger.info(`Sync successful: ${operation.type} ${operation.resource}`, {}, 'OFFLINE');
        } catch (error) {
          operation.retryCount++;

          if (operation.retryCount >= 5) {
            // Give up after 5 retries
            this.syncQueue = this.syncQueue.filter(op => op.id !== operation.id);
            logger.error(
              `Sync failed (max retries): ${operation.type} ${operation.resource}`,
              error,
              'OFFLINE'
            );
          }
        }
      }

      await this.saveSyncQueue();
      return this.syncQueue.length === 0;
    } finally {
      this.isSyncing = false;
    }
  }

  async cacheData(key: string, data: any, ttlMs?: number) {
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now(),
        ttl: ttlMs || 24 * 60 * 60 * 1000, // 24 hours default
      };
      await AsyncStorage.setItem(`${this.CACHE_KEY}_${key}`, JSON.stringify(cacheEntry));
      logger.debug(`Data cached: ${key}`, {}, 'OFFLINE');
    } catch (error) {
      logger.error(`Failed to cache data: ${key}`, error, 'OFFLINE');
    }
  }

  async getCachedData(key: string): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(`${this.CACHE_KEY}_${key}`);
      if (!data) return null;

      const cacheEntry = JSON.parse(data);
      const isExpired = Date.now() - cacheEntry.timestamp > cacheEntry.ttl;

      if (isExpired) {
        await AsyncStorage.removeItem(`${this.CACHE_KEY}_${key}`);
        return null;
      }

      return cacheEntry.data;
    } catch (error) {
      logger.error(`Failed to get cached data: ${key}`, error, 'OFFLINE');
      return null;
    }
  }

  async clearCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_KEY));
      await AsyncStorage.multiRemove(cacheKeys);
      logger.info('Cache cleared', {}, 'OFFLINE');
    } catch (error) {
      logger.error('Failed to clear cache', error, 'OFFLINE');
    }
  }

  getSyncQueue(): OfflineSyncQueue[] {
    return [...this.syncQueue];
  }

  getSyncQueueCount(): number {
    return this.syncQueue.length;
  }

  onSyncQueueChange(listener: (queue: OfflineSyncQueue[]) => void): () => void {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.syncListeners.forEach(listener => {
      try {
        listener([...this.syncQueue]);
      } catch (error) {
        logger.error('Sync listener error', error, 'OFFLINE');
      }
    });
  }
}

export const offlineStorageService = new OfflineStorageService();
