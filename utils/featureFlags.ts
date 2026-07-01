// Feature flags system for gradual rollout and A/B testing
import { logger } from './logger';

export interface FeatureFlagConfig {
  [key: string]: boolean | number | string;
}

type FeatureListener = (flags: FeatureFlagConfig) => void;

class FeatureFlagService {
  private flags: FeatureFlagConfig = {
    // Authentication features
    AUTH_BIOMETRIC: false,
    AUTH_SOCIAL_LOGIN: false,

    // App features
    OFFLINE_MODE: false,
    ADVANCED_ANALYTICS: false,
    EXPERIMENTAL_UI: false,

    // Performance features
    ENABLE_CRASH_REPORTING: true,
    ENABLE_PERFORMANCE_MONITORING: true,

    // Helmet features
    HELMET_BATTERY_PREDICTION: false,
    HELMET_AI_INSIGHTS: false,
  };

  private listeners: FeatureListener[] = [];

  constructor() {
    this.initializeFlags();
  }

  private initializeFlags() {
    // Load from remote config or local storage
    logger.debug('Feature flags initialized', this.flags, 'FEATURES');
  }

  isEnabled(flagName: string): boolean {
    const flag = this.flags[flagName];
    return typeof flag === 'boolean' ? flag : false;
  }

  get(flagName: string): any {
    return this.flags[flagName];
  }

  setFlag(flagName: string, value: any) {
    this.flags[flagName] = value;
    logger.debug(`Feature flag updated: ${flagName} = ${value}`, {}, 'FEATURES');
    this.notifyListeners();
  }

  setFlags(flags: Partial<FeatureFlagConfig>) {
    this.flags = { ...this.flags, ...flags };
    logger.debug('Feature flags updated', flags, 'FEATURES');
    this.notifyListeners();
  }

  onFlagChange(listener: FeatureListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.flags);
      } catch (error) {
        logger.error('Feature flag listener error', error, 'FEATURES');
      }
    });
  }

  getAll(): FeatureFlagConfig {
    return { ...this.flags };
  }
}

export const featureFlagService = new FeatureFlagService();
