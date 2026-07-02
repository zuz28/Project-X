import { create } from 'zustand';

// Impact tracking data
export interface Impact {
  id: string;
  timestamp: number;
  gForce: number;
  rotational: number;
  flagged: boolean;
}

// Training session
export interface Session {
  id: string;
  date: number;
  impacts: Impact[];
}

// User authentication
export interface User {
  id: string;
  email: string;
  name: string;
}

// App state
interface AppState {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  clearAll: () => void;

  // Session/Impact tracking
  sessions: Session[];
  currentSession: Session | null;
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  setCurrentSession: (session: Session | null) => void;
  addImpact: (impact: Impact) => void;

  // BLE device connection
  isConnected: boolean;
  connectedDeviceName: string | null;
  connectedHelmetId: string | null;
  setConnected: (connected: boolean) => void;
  setConnectedDeviceName: (name: string | null) => void;
  setConnectedHelmetId: (id: string | null) => void;

  // Tracking
  lastImpactTime: number | null;
}

export const useStore = create<AppState>((set) => ({
  // Auth
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: user !== null }),
  logout: () => set({
    user: null,
    isAuthenticated: false,
    sessions: [],
    currentSession: null,
    isConnected: false,
    connectedDeviceName: null,
    connectedHelmetId: null,
  }),
  // Clears tracking data only — the user stays signed in. Signing out is a
  // separate action (logout) so "Clear All Data" doesn't strand a stale
  // persisted login session.
  clearAll: () => set({
    sessions: [],
    currentSession: null,
    isConnected: false,
    connectedDeviceName: null,
    connectedHelmetId: null,
    lastImpactTime: null,
  }),

  // Sessions
  sessions: [],
  currentSession: null,
  lastImpactTime: null,

  setSessions: (sessions) => set({ sessions }),
  addSession: (session) =>
    set((state) => ({
      sessions: [session, ...state.sessions],
      currentSession: session,
    })),
  setCurrentSession: (session) => set({ currentSession: session }),
  addImpact: (impact) =>
    set((state) => {
      if (!state.currentSession) return state;
      const updatedSession = {
        ...state.currentSession,
        impacts: [impact, ...state.currentSession.impacts],
      };
      return {
        currentSession: updatedSession,
        // Keep the sessions list in sync so History/Analytics see live impacts
        sessions: state.sessions.map((s) =>
          s.id === updatedSession.id ? updatedSession : s
        ),
        lastImpactTime: impact.timestamp,
      };
    }),

  // BLE
  isConnected: false,
  connectedDeviceName: null,
  connectedHelmetId: null,
  setConnected: (connected) => set({ isConnected: connected }),
  setConnectedDeviceName: (name) => set({ connectedDeviceName: name }),
  setConnectedHelmetId: (id) => set({ connectedHelmetId: id }),
}));
