import { useEffect, useRef } from 'react';
import { helmet, HelmetBLE } from '../services/ble';
import { useStore } from '../store';
import { addSession } from '../services/db';
import { syncSession } from '../services/supabase';
import type { Impact, Session } from '../services/mockImpacts';

export function useHelmet() {
  const {
    isConnected,
    setConnected,
    setScanning,
    currentSession,
    setCurrentSession,
    addImpactToSession,
    userId,
  } = useStore();

  const sessionRef = useRef<Session | null>(currentSession);

  useEffect(() => {
    sessionRef.current = currentSession;
  }, [currentSession]);

  const startScan = async () => {
    try {
      setScanning(true);
      const devices = await helmet.startScan();
      return devices;
    } finally {
      setScanning(false);
    }
  };

  const connectToHelmet = async (deviceId: string) => {
    try {
      const devices = await helmet.startScan();
      const device = devices.find(d => d.id === deviceId);

      if (!device) {
        throw new Error('Device not found');
      }

      await helmet.connect(device);
      setConnected(true);

      helmet.onImpactReceived((impact: Impact) => {
        addImpactToSession(impact);

        if (sessionRef.current && userId) {
          syncSession(sessionRef.current, userId).catch(console.error);
        }
      });
    } catch (error) {
      console.error('Connection error:', error);
      setConnected(false);
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      await helmet.disconnect();
      setConnected(false);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const createNewSession = (session: Session) => {
    setCurrentSession(session);
    addSession(session).catch(console.error);
  };

  return {
    isConnected,
    startScan,
    connectToHelmet,
    disconnect,
    createNewSession,
    currentSession,
  };
}
