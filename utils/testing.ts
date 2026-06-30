import type { Impact, Session } from '../services/mockImpacts';

export function createMockImpact(overrides?: Partial<Impact>): Impact {
  const now = Date.now();
  return {
    id: `impact-${Math.random()}`,
    timestamp: now,
    gForce: 50 + Math.random() * 30,
    rotational: 2000 + Math.random() * 3000,
    flagged: Math.random() > 0.8,
    ...overrides,
  };
}

export function createMockSession(overrides?: Partial<Session>): Session {
  const now = Date.now();
  const impactCount = 3 + Math.floor(Math.random() * 8);

  return {
    id: `session-${now}`,
    date: now,
    impacts: Array.from({ length: impactCount }, (_, i) =>
      createMockImpact({
        timestamp: now - i * 60000,
      })
    ),
    ...overrides,
  };
}

export function createHighRiskImpact(): Impact {
  return createMockImpact({
    gForce: 75 + Math.random() * 25,
    rotational: 7000 + Math.random() * 2000,
    flagged: true,
  });
}

export function createLowRiskImpact(): Impact {
  return createMockImpact({
    gForce: 20 + Math.random() * 15,
    rotational: 1000 + Math.random() * 2000,
    flagged: false,
  });
}

export function createMockSessionWithMixedImpacts(): Session {
  const now = Date.now();
  const highRiskCount = 2 + Math.floor(Math.random() * 2);
  const lowRiskCount = 3 + Math.floor(Math.random() * 3);

  const impacts: Impact[] = [];

  for (let i = 0; i < highRiskCount; i++) {
    impacts.push(
      createHighRiskImpact({
        timestamp: now - i * 120000,
      })
    );
  }

  for (let i = 0; i < lowRiskCount; i++) {
    impacts.push(
      createLowRiskImpact({
        timestamp: now - (highRiskCount + i) * 60000,
      })
    );
  }

  return {
    id: `session-${now}`,
    date: now,
    impacts: impacts.sort((a, b) => b.timestamp - a.timestamp),
  };
}

type CreateHighRiskImpactOverrides = Partial<Impact>;

export function createHighRiskImpact(
  overrides?: CreateHighRiskImpactOverrides
): Impact {
  return createMockImpact({
    gForce: 75 + Math.random() * 25,
    rotational: 7000 + Math.random() * 2000,
    flagged: true,
    ...overrides,
  });
}

type CreateLowRiskImpactOverrides = Partial<Impact>;

export function createLowRiskImpact(
  overrides?: CreateLowRiskImpactOverrides
): Impact {
  return createMockImpact({
    gForce: 20 + Math.random() * 15,
    rotational: 1000 + Math.random() * 2000,
    flagged: false,
    ...overrides,
  });
}
