import type { Session, Impact } from '../services/mockImpacts';
import { calculateSessionStats } from './analytics';
import { logger } from './logger';

export class SessionManager {
  private sessions: Map<string, Session> = new Map();

  /**
   * Creates a new session
   */
  createSession(): Session {
    const now = Date.now();
    const session: Session = {
      id: `session-${now}`,
      date: now,
      impacts: [],
    };
    this.sessions.set(session.id, session);
    logger.info('SessionManager', 'Session created', { sessionId: session.id });
    return session;
  }

  /**
   * Adds an impact to a session
   */
  addImpact(sessionId: string, impact: Impact): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.impacts.push(impact);
    logger.debug('SessionManager', 'Impact added', {
      sessionId,
      gForce: impact.gForce,
    });
  }

  /**
   * Merges multiple sessions into one
   */
  mergeSessions(sessionIds: string[]): Session {
    const merged = this.createSession();

    for (const id of sessionIds) {
      const session = this.sessions.get(id);
      if (session) {
        merged.impacts.push(...session.impacts);
      }
    }

    // Sort by timestamp
    merged.impacts.sort((a, b) => b.timestamp - a.timestamp);

    logger.info('SessionManager', 'Sessions merged', {
      count: sessionIds.length,
      totalImpacts: merged.impacts.length,
    });

    return merged;
  }

  /**
   * Splits a session at a timestamp
   */
  splitSession(sessionId: string, timestamp: number): [Session, Session] {
    const original = this.sessions.get(sessionId);
    if (!original) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const before = this.createSession();
    const after = this.createSession();

    for (const impact of original.impacts) {
      if (impact.timestamp >= timestamp) {
        before.impacts.push(impact);
      } else {
        after.impacts.push(impact);
      }
    }

    logger.info('SessionManager', 'Session split', {
      original: sessionId,
      before: before.impacts.length,
      after: after.impacts.length,
    });

    return [before, after];
  }

  /**
   * Filters impacts from a session
   */
  filterSession(sessionId: string, predicate: (impact: Impact) => boolean): Session {
    const original = this.sessions.get(sessionId);
    if (!original) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const filtered = this.createSession();
    filtered.impacts = original.impacts.filter(predicate);

    logger.info('SessionManager', 'Session filtered', {
      original: original.impacts.length,
      filtered: filtered.impacts.length,
    });

    return filtered;
  }

  /**
   * Checks if session has high-risk impacts
   */
  hasHighRiskImpacts(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    return session.impacts.some(i => i.flagged);
  }

  /**
   * Gets summary for a session
   */
  getSessionSummary(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const stats = calculateSessionStats(session);
    return {
      id: session.id,
      date: new Date(session.date),
      stats,
      impacts: session.impacts,
    };
  }

  /**
   * Exports session to plain object
   */
  exportSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    return JSON.parse(JSON.stringify(session));
  }

  /**
   * Imports a session
   */
  importSession(session: Session): void {
    this.sessions.set(session.id, {
      ...session,
      impacts: [...session.impacts],
    });
    logger.info('SessionManager', 'Session imported', {
      sessionId: session.id,
      impacts: session.impacts.length,
    });
  }

  /**
   * Lists all sessions
   */
  listSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Removes a session
   */
  removeSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    logger.info('SessionManager', 'Session removed', { sessionId });
  }

  /**
   * Clears all sessions
   */
  clear(): void {
    this.sessions.clear();
    logger.info('SessionManager', 'All sessions cleared');
  }

  /**
   * Gets session size in bytes
   */
  getSessionSize(sessionId: string): number {
    const session = this.sessions.get(sessionId);
    if (!session) return 0;
    return new Blob([JSON.stringify(session)]).size;
  }

  /**
   * Gets total size of all sessions
   */
  getTotalSize(): number {
    return Array.from(this.sessions.values()).reduce(
      (total, session) => total + this.getSessionSize(session.id),
      0
    );
  }
}

export const sessionManager = new SessionManager();
