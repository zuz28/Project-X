import type { Impact, Session } from '../services/mockImpacts';

export const IMPACT_THRESHOLDS = {
  MIN_G_FORCE: 0,
  MAX_G_FORCE: 200,
  MIN_ROTATIONAL: 0,
  MAX_ROTATIONAL: 10000,
  CONCUSSION_RISK_G: 60,
  CONCUSSION_RISK_ROTATIONAL: 6000,
};

export function validateImpact(impact: any): impact is Impact {
  if (!impact || typeof impact !== 'object') return false;

  const hasValidId = typeof impact.id === 'string' && impact.id.length > 0;
  const hasValidTimestamp =
    typeof impact.timestamp === 'number' && impact.timestamp > 0;
  const hasValidGForce =
    typeof impact.gForce === 'number' &&
    impact.gForce >= IMPACT_THRESHOLDS.MIN_G_FORCE &&
    impact.gForce <= IMPACT_THRESHOLDS.MAX_G_FORCE;
  const hasValidRotational =
    typeof impact.rotational === 'number' &&
    impact.rotational >= IMPACT_THRESHOLDS.MIN_ROTATIONAL &&
    impact.rotational <= IMPACT_THRESHOLDS.MAX_ROTATIONAL;
  const hasValidFlagged = typeof impact.flagged === 'boolean';

  return (
    hasValidId &&
    hasValidTimestamp &&
    hasValidGForce &&
    hasValidRotational &&
    hasValidFlagged
  );
}

export function validateSession(session: any): session is Session {
  if (!session || typeof session !== 'object') return false;

  const hasValidId = typeof session.id === 'string' && session.id.length > 0;
  const hasValidDate = typeof session.date === 'number' && session.date > 0;
  const hasValidImpacts =
    Array.isArray(session.impacts) &&
    session.impacts.every(impact => validateImpact(impact));

  return hasValidId && hasValidDate && hasValidImpacts;
}

export function calculateConcussionRisk(impact: Impact): {
  risk: 'low' | 'moderate' | 'high';
  reasons: string[];
} {
  const reasons: string[] = [];
  let risk: 'low' | 'moderate' | 'high' = 'low';

  if (impact.gForce >= IMPACT_THRESHOLDS.CONCUSSION_RISK_G) {
    reasons.push(`High G-force (${impact.gForce}G)`);
    risk = 'high';
  }

  if (impact.rotational >= IMPACT_THRESHOLDS.CONCUSSION_RISK_ROTATIONAL) {
    reasons.push(`High rotational acceleration (${impact.rotational} rad/s²)`);
    risk = 'high';
  }

  if (impact.gForce >= 50 && impact.rotational >= 5000) {
    reasons.push('Combined force threshold exceeded');
    if (risk === 'low') risk = 'moderate';
  }

  if (impact.gForce >= 40 && impact.gForce < 60) {
    reasons.push('Moderate impact');
    if (risk === 'low') risk = 'moderate';
  }

  if (reasons.length === 0) {
    reasons.push('Impact within normal thresholds');
  }

  return { risk, reasons };
}

export function sanitizeImpact(impact: Partial<Impact>): Partial<Impact> {
  return {
    ...(typeof impact.id === 'string' && { id: impact.id.substring(0, 100) }),
    ...(typeof impact.timestamp === 'number' && { timestamp: impact.timestamp }),
    ...(typeof impact.gForce === 'number' && {
      gForce: Math.max(
        IMPACT_THRESHOLDS.MIN_G_FORCE,
        Math.min(IMPACT_THRESHOLDS.MAX_G_FORCE, impact.gForce)
      ),
    }),
    ...(typeof impact.rotational === 'number' && {
      rotational: Math.max(
        IMPACT_THRESHOLDS.MIN_ROTATIONAL,
        Math.min(IMPACT_THRESHOLDS.MAX_ROTATIONAL, impact.rotational)
      ),
    }),
    ...(typeof impact.flagged === 'boolean' && { flagged: impact.flagged }),
  };
}
