import { create } from 'zustand';

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

interface AppState {
  sessions: Session[];
  currentSession: Session | null;
  isConnected: boolean;
  isScanning: boolean;
  connectedDeviceName: string | null;
  lastImpactTime: number | null;

  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  setCurrentSession: (session: Session | null) => void;
  setConnected: (connected: boolean) => void;
  setScanning: (scanning: boolean) => void;
  setConnectedDeviceName: (name: string | null) => void;
  addImpact: (impact: Impact) => void;
  clearAll: () => void;
}

export const useStore = create<AppState>((set) => ({
  sessions: [],
  currentSession: null,
  isConnected: false,
  isScanning: false,
  connectedDeviceName: null,
  lastImpactTime: null,

  setSessions: (sessions) => set({ sessions }),
  addSession: (session) =>
    set((state) => ({
      sessions: [session, ...state.sessions],
      currentSession: session,
    })),
  setCurrentSession: (session) => set({ currentSession: session }),
  setConnected: (connected) => set({ isConnected: connected }),
  setScanning: (scanning) => set({ isScanning: scanning }),
  setConnectedDeviceName: (name) => set({ connectedDeviceName: name }),
  addImpact: (impact) =>
    set((state) => {
      if (!state.currentSession) return state;
      return {
        currentSession: {
          ...state.currentSession,
          impacts: [impact, ...state.currentSession.impacts],
        },
        lastImpactTime: impact.timestamp,
      };
    }),
  clearAll: () => set({
    sessions: [],
    currentSession: null,
    isConnected: false,
    isScanning: false,
    connectedDeviceName: null,
    lastImpactTime: null,
  }),
}));
