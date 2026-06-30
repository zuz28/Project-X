import { FEATURES } from '../config/constants';

export type FeatureKey = keyof typeof FEATURES;

/**
 * Feature flag manager for controlling feature availability
 */
export class FeatureFlagManager {
  private flags: Record<string, boolean> = { ...FEATURES };

  /**
   * Check if a feature is enabled
   */
  isEnabled(feature: FeatureKey): boolean {
    return this.flags[feature] ?? false;
  }

  /**
   * Enable a feature
   */
  enable(feature: FeatureKey): void {
    this.flags[feature] = true;
  }

  /**
   * Disable a feature
   */
  disable(feature: FeatureKey): void {
    this.flags[feature] = false;
  }

  /**
   * Toggle a feature
   */
  toggle(feature: FeatureKey): boolean {
    this.flags[feature] = !this.flags[feature];
    return this.flags[feature];
  }

  /**
   * Set multiple flags
   */
  setFlags(flags: Partial<Record<FeatureKey, boolean>>): void {
    Object.assign(this.flags, flags);
  }

  /**
   * Get all flags
   */
  getAllFlags(): Record<FeatureKey, boolean> {
    return { ...this.flags } as Record<FeatureKey, boolean>;
  }

  /**
   * Reset to defaults
   */
  reset(): void {
    this.flags = { ...FEATURES };
  }
}

export const featureFlagManager = new FeatureFlagManager();

/**
 * Conditional rendering helper
 */
export function renderIfEnabled<T>(feature: FeatureKey, component: T | null): T | null {
  return featureFlagManager.isEnabled(feature) ? component : null;
}

/**
 * Type-safe feature checking
 */
export const features = {
  cloudSync: () => featureFlagManager.isEnabled('CLOUD_SYNC'),
  notifications: () => featureFlagManager.isEnabled('NOTIFICATIONS'),
  impactReplay: () => featureFlagManager.isEnabled('IMPACT_REPLAY'),
  socialSharing: () => featureFlagManager.isEnabled('SOCIAL_SHARING'),
  advancedAnalytics: () => featureFlagManager.isEnabled('ADVANCED_ANALYTICS'),
  customAlerts: () => featureFlagManager.isEnabled('CUSTOM_ALERTS'),
};
