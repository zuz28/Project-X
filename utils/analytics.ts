import type { Impact, Session } from '../services/mockImpacts';

export interface SessionStats {
  totalImpacts: number;
  maxGForce: number;
  avgGForce: number;
  maxRotational: number;
  flaggedCount: number;
  riskPercentage: number;
  duration: number; // ms
  severity: 'low' | 'moderate' | 'high';
}

export interface TimeseriesData {
  timestamp: number;
  gForce: number;
  rotational: number;
  flagged: boolean;
}

export function calculateSessionStats(session: Session): SessionStats {
  const impacts = session.impacts;

  if (impacts.length === 0) {
    return {
      totalImpacts: 0,
      maxGForce: 0,
      avgGForce: 0,
      maxRotational: 0,
      flaggedCount: 0,
      riskPercentage: 0,
      duration: 0,
      severity: 'low',
    };
  }

  const gForces = impacts.map(i => i.gForce);
  const maxGForce = Math.max(...gForces);
  const avgGForce = gForces.reduce((a, b) => a + b, 0) / gForces.length;
  const maxRotational = Math.max(...impacts.map(i => i.rotational));
  const flaggedCount = impacts.filter(i => i.flagged).length;
  const riskPercentage = (flaggedCount / impacts.length) * 100;

  const minTimestamp = Math.min(...impacts.map(i => i.timestamp));
  const maxTimestamp = Math.max(...impacts.map(i => i.timestamp));
  const duration = maxTimestamp - minTimestamp;

  let severity: 'low' | 'moderate' | 'high' = 'low';
  if (flaggedCount >= 3 || maxGForce > 80) {
    severity = 'high';
  } else if (flaggedCount >= 1 || maxGForce > 60) {
    severity = 'moderate';
  }

  return {
    totalImpacts: impacts.length,
    maxGForce,
    avgGForce: parseFloat(avgGForce.toFixed(1)),
    maxRotational,
    flaggedCount,
    riskPercentage: parseFloat(riskPercentage.toFixed(1)),
    duration,
    severity,
  };
}

export function calculateTrendStats(sessions: Session[]) {
  if (sessions.length === 0) {
    return {
      avgImpactsPerSession: 0,
      totalFlaggedImpacts: 0,
      highRiskSessions: 0,
      sessionCount: 0,
    };
  }

  const sessionStats = sessions.map(s => calculateSessionStats(s));
  const avgImpactsPerSession =
    sessionStats.reduce((a, b) => a + b.totalImpacts, 0) / sessions.length;
  const totalFlaggedImpacts = sessionStats.reduce((a, b) => a + b.flaggedCount, 0);
  const highRiskSessions = sessionStats.filter(s => s.severity === 'high').length;

  return {
    avgImpactsPerSession: parseFloat(avgImpactsPerSession.toFixed(1)),
    totalFlaggedImpacts,
    highRiskSessions,
    sessionCount: sessions.length,
  };
}

export function getTimeseriesData(session: Session): TimeseriesData[] {
  return session.impacts
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(impact => ({
      timestamp: impact.timestamp,
      gForce: impact.gForce,
      rotational: impact.rotational,
      flagged: impact.flagged,
    }));
}

export function filterImpactsByRange(
  impacts: Impact[],
  minG?: number,
  maxG?: number,
  flaggedOnly?: boolean
): Impact[] {
  return impacts.filter(impact => {
    if (flaggedOnly && !impact.flagged) return false;
    if (minG !== undefined && impact.gForce < minG) return false;
    if (maxG !== undefined && impact.gForce > maxG) return false;
    return true;
  });
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}
