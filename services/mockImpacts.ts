export interface Impact {
  id: string;
  timestamp: number;
  gForce: number;
  rotational: number;
  flagged: boolean;
}

export interface Session {
  id: string;
  date: number;
  impacts: Impact[];
}

export function generateSession(): Session {
  const now = Date.now();
  const impacts = Array.from({ length: 5 + Math.floor(Math.random() * 10) }, (_, i) => ({
    id: `${now}-${i}`,
    timestamp: now - i * 60000,
    gForce: +(20 + Math.random() * 80).toFixed(1),
    rotational: Math.round(1000 + Math.random() * 5000),
    flagged: Math.random() > 0.7,
  }));
  return { id: `${now}`, date: now, impacts };
}

export function generateMultipleSessions(count: number): Session[] {
  const sessions: Session[] = [];
  for (let i = 0; i < count; i++) {
    const session = generateSession();
    session.date = Date.now() - i * 24 * 60 * 60 * 1000;
    session.id = `session-${i}-${session.date}`;
    sessions.push(session);
  }
  return sessions;
}
