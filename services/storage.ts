import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '../store';
import { logger } from '../utils/logger';

const SESSIONS_KEY = '@vela_sessions';

export async function saveSessions(sessions: Session[]): Promise<void> {
  try {
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    logger.error('Failed to save sessions', error, 'STORAGE');
  }
}

export async function getSessions(): Promise<Session[]> {
  try {
    const data = await AsyncStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    logger.error('Failed to load sessions', error, 'STORAGE');
    return [];
  }
}

export async function addSession(session: Session): Promise<void> {
  try {
    const sessions = await getSessions();
    sessions.unshift(session);
    await saveSessions(sessions);
  } catch (error) {
    logger.error('Failed to add session', error, 'STORAGE');
  }
}

export async function getSession(id: string): Promise<Session | null> {
  try {
    const sessions = await getSessions();
    return sessions.find(s => s.id === id) || null;
  } catch (error) {
    logger.error('Failed to get session', error, 'STORAGE');
    return null;
  }
}
