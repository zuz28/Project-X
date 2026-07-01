// Performance monitoring and optimization
// Tracks metrics, identifies bottlenecks, optimizes UX

import React from 'react';
import { logger } from './logger';

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: any;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private markers: Map<string, number> = new Map();
  private maxMetrics = 1000;

  startMeasure(label: string) {
    this.markers.set(label, performance.now());
  }

  endMeasure(label: string, metadata?: any) {
    const startTime = this.markers.get(label);
    if (!startTime) {
      console.warn(`Measure "${label}" not started`);
      return;
    }

    const duration = performance.now() - startTime;
    const metric: PerformanceMetric = {
      name: label,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations
    if (duration > 100) {
      logger.warn(`Slow operation: ${label} took ${duration.toFixed(2)}ms`, metadata, 'PERF');
    }

    this.markers.delete(label);
    return duration;
  }

  async measureAsync<T>(
    label: string,
    operation: () => Promise<T>,
    metadata?: any
  ): Promise<T> {
    this.startMeasure(label);
    try {
      const result = await operation();
      this.endMeasure(label, metadata);
      return result;
    } catch (error) {
      this.endMeasure(label, { ...metadata, error: true });
      throw error;
    }
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return this.metrics;
  }

  getAverageDuration(name: string): number {
    const metrics = this.metrics.filter(m => m.name === name);
    if (metrics.length === 0) return 0;

    const sum = metrics.reduce((acc, m) => acc + m.duration, 0);
    return sum / metrics.length;
  }

  getStats() {
    return {
      totalMetrics: this.metrics.length,
      averageDuration: this.metrics.length > 0
        ? (this.metrics.reduce((acc, m) => acc + m.duration, 0) / this.metrics.length).toFixed(2)
        : 0,
      slowestOperation: this.metrics.length > 0
        ? this.metrics.reduce((max, m) => m.duration > max.duration ? m : max)
        : null,
    };
  }

  clearMetrics() {
    this.metrics = [];
    this.markers.clear();
  }

  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      stats: this.getStats(),
    }, null, 2);
  }
}

export const performanceMonitor = new PerformanceMonitor();

// React DevTools profiler helper
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return (props: P) => {
    React.useEffect(() => {
      performanceMonitor.startMeasure(`render_${componentName}`);
      return () => {
        performanceMonitor.endMeasure(`render_${componentName}`);
      };
    }, []);

    return <Component {...props} />;
  };
}
