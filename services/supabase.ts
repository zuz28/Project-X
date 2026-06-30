import { createClient } from '@supabase/supabase-js';
import type { Session } from './mockImpacts';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function syncSession(session: Session, userId: string): Promise<void> {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured, skipping sync');
      return;
    }

    const { error } = await supabase.from('sessions').upsert({
      id: session.id,
      user_id: userId,
      date: new Date(session.date).toISOString(),
      impacts: session.impacts,
    });

    if (error) {
      console.error('Failed to sync session:', error);
    }
  } catch (error) {
    console.error('Sync error:', error);
  }
}

export async function getSyncedSessions(userId: string): Promise<Session[]> {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return [];
    }

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Failed to fetch synced sessions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}
