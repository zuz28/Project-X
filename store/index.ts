import { create } from 'zustand';
import type { Session, Impact } from '../services/mockImpacts';

interface AppState {
  sessions: Session[];
  currentSession: Session | null;
  isConnected: boolean;
  isScanning: boolean;
  userId: string | null;

  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  setCurrentSession: (session: Session | null) => void;
  setConnected: (connected: boolean) => void;
  setScanning: (scanning: boolean) => void;
  setUserId: (userId: string) => void;
  addImpactToSession: (impact: Impact) => void;
  clearAll: () => void;
}

export const useStore = create<AppState>((set) => ({
  sessions: [],
  currentSession: null,
  isConnected: false,
  isScanning: false,
  userId: null,

  setSessions: (sessions) => set({ sessions }),
  addSession: (session) =>
    set((state) => ({
      sessions: [session, ...state.sessions],
    })),
  setCurrentSession: (session) => set({ currentSession: session }),
  setConnected: (connected) => set({ isConnected: connected }),
  setScanning: (scanning) => set({ isScanning: scanning }),
  setUserId: (userId) => set({ userId }),
  addImpactToSession: (impact) =>
    set((state) => {
      if (!state.currentSession) return state;
      return {
        currentSession: {
          ...state.currentSession,
          impacts: [impact, ...state.currentSession.impacts],
        },
      };
    }),
  clearAll: () => set({
    sessions: [],
    currentSession: null,
    isConnected: false,
    isScanning: false,
    userId: null,
  }),
}));
