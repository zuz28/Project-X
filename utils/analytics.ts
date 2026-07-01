// Analytics and event tracking
// Integrates with Mixpanel, Segment, Firebase Analytics, etc.

import { logger } from './logger';

export enum AnalyticsEvent {
  // Auth events
  USER_SIGNUP = 'user_signup',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  PASSWORD_RESET = 'password_reset',

  // Helmet events
  HELMET_PAIRED = 'helmet_paired',
  HELMET_UNPAIRED = 'helmet_unpaired',
  HELMET_CONNECTED = 'helmet_connected',
  HELMET_DISCONNECTED = 'helmet_disconnected',

  // Impact events
  IMPACT_RECORDED = 'impact_recorded',
  IMPACT_FLAGGED = 'impact_flagged',
  SESSION_STARTED = 'session_started',
  SESSION_ENDED = 'session_ended',

  // App events
  SCREEN_VIEWED = 'screen_viewed',
  BUTTON_TAPPED = 'button_tapped',
  ERROR_OCCURRED = 'error_occurred',
  FEATURE_USED = 'feature_used',
}

export interface AnalyticsProperties {
  [key: string]: string | number | boolean | null | undefined;
}

class AnalyticsService {
  private sessionId: string = this.generateSessionId();
  private userId: string | null = null;
  private eventQueue: Array<{ event: AnalyticsEvent; properties: AnalyticsProperties }> = [];

  constructor() {
    // Initialize analytics provider
    this.initializeProviders();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeProviders() {
    // Initialize Mixpanel, Segment, Firebase Analytics, etc.
    logger.debug('Analytics providers initialized', {}, 'ANALYTICS');
  }

  setUserId(userId: string) {
    this.userId = userId;
    // Set user ID in all providers
  }

  setUserProperties(properties: AnalyticsProperties) {
    // Set user properties in all providers
    logger.debug('User properties set', properties, 'ANALYTICS');
  }

  trackEvent(event: AnalyticsEvent, properties?: AnalyticsProperties) {
    const eventData = {
      event,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        userId: this.userId,
      },
    };

    // Queue event
    this.eventQueue.push(eventData);

    // Log locally
    logger.debug(`Event tracked: ${event}`, eventData.properties, 'ANALYTICS');

    // Send immediately or batch based on config
    if (this.shouldSendImmediately(event)) {
      this.flush();
    }
  }

  trackScreenView(screenName: string, properties?: AnalyticsProperties) {
    this.trackEvent(AnalyticsEvent.SCREEN_VIEWED, {
      screen: screenName,
      ...properties,
    });
  }

  trackError(error: Error, context?: string) {
    this.trackEvent(AnalyticsEvent.ERROR_OCCURRED, {
      message: error.message,
      stack: error.stack,
      context,
    });
  }

  private shouldSendImmediately(event: AnalyticsEvent): boolean {
    // Critical events send immediately
    const criticalEvents = [
      AnalyticsEvent.ERROR_OCCURRED,
      AnalyticsEvent.USER_LOGIN,
      AnalyticsEvent.USER_LOGOUT,
    ];
    return criticalEvents.includes(event);
  }

  async flush() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Send to analytics provider
      // await analyticsProvider.track(events);
      logger.debug('Analytics events flushed', { count: events.length }, 'ANALYTICS');
    } catch (error) {
      logger.error('Failed to flush analytics', error, 'ANALYTICS');
      // Re-queue events on failure
      this.eventQueue.unshift(...events);
    }
  }

  async identify(userId: string, properties?: AnalyticsProperties) {
    this.setUserId(userId);
    this.setUserProperties(properties || {});
    await this.flush();
  }

  reset() {
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.eventQueue = [];
  }
}

export const analyticsService = new AnalyticsService();
