import type { Session, Impact } from '../store';

export function generateImpacts(count: number = 8): Impact[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    id: `impact-${now}-${i}`,
    timestamp: now - i * 120000,
    gForce: +(20 + Math.random() * 70).toFixed(1),
    rotational: Math.round(1000 + Math.random() * 5000),
    flagged: Math.random() > 0.75,
  }));
}

export function generateSession(): Session {
  const now = Date.now();
  return {
    id: `session-${now}`,
    date: now,
    impacts: generateImpacts(8 + Math.floor(Math.random() * 6)),
  };
}

export function generateMultipleSessions(count: number): Session[] {
  return Array.from({ length: count }, (_, i) => {
    const date = Date.now() - i * 86400000;
    return {
      id: `session-${date}`,
      date,
      impacts: generateImpacts(5 + Math.floor(Math.random() * 8)),
    };
  });
}
