import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useStore } from '../store';
import { getSessions, saveSessions } from '../services/storage';
import { bleService } from '../services/ble';
import { crashReportingService } from '../services/crashReporting';
import { ImpactAlert } from '../components/ImpactAlert';
import { ErrorBoundary } from '../utils/errorBoundary';
import { logger } from '../utils/logger';
import { loadPersistedSession } from '../hooks/useAuth';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, setUser, setSessions } = useStore();
  const [lastImpact, setLastImpact] = useState<any>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // One-time startup: crash reporting + restore persisted login session
  useEffect(() => {
    const sentryDSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
    if (sentryDSN) {
      crashReportingService.initialize(sentryDSN);
    } else {
      logger.warn('Sentry DSN not configured - crash reporting disabled', {}, 'APP');
    }

    loadPersistedSession()
      .then((savedUser) => {
        if (savedUser) {
          setUser(savedUser);
          logger.info('Session restored', { userId: savedUser.id }, 'APP');
        }
      })
      .finally(() => setAuthChecked(true));
  }, []);

  // Route guard: unauthenticated users go to login, authenticated users
  // are kept out of the auth screens.
  useEffect(() => {
    if (!authChecked) return;

    const inAuthGroup = segments[0] === 'auth';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [authChecked, isAuthenticated, segments]);

  // Load sessions and listen for BLE impacts while logged in
  useEffect(() => {
    if (!isAuthenticated) return;

    loadSessions();
    const unsubscribe = setupBLEListener();
    logger.info('App authenticated', {}, 'APP');
    return unsubscribe;
  }, [isAuthenticated]);

  const loadSessions = async () => {
    try {
      const sessions = await getSessions();
      setSessions(sessions);
    } catch (error) {
      logger.error('Failed to load sessions', error, 'APP');
    }
  };

  const setupBLEListener = () => {
    const unsubscribe = bleService.onImpact((impactData) => {
      // Read live state — a closure over render-time values would capture a
      // stale (often null) currentSession and silently drop every impact.
      const state = useStore.getState();
      if (!state.currentSession) return;

      const impact = {
        id: `impact-${impactData.timestamp}-${Math.floor(Math.random() * 1e6)}`,
        timestamp: impactData.timestamp,
        gForce: impactData.gForce,
        rotational: impactData.rotational,
        flagged: impactData.gForce > 50,
      };

      state.addImpact(impact);
      setLastImpact(impact);
      setShowAlert(true);

      // Persist so live impacts survive an app restart
      saveSessions(useStore.getState().sessions);
    });

    return () => unsubscribe();
  };

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => setShowAlert(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        logger.error('Error Boundary caught', error, 'ROOT_LAYOUT');
      }}
    >
      <View style={{ flex: 1 }}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/signup" />
          <Stack.Screen name="auth/forgot-password" />
          <Stack.Screen name="impact/[id]" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="connect" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="settings" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="helmet" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="session/[id]" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="insights" options={{ animation: 'slide_from_bottom' }} />
        </Stack>
        {lastImpact && isAuthenticated && (
          <ImpactAlert
            gForce={lastImpact.gForce}
            timestamp={lastImpact.timestamp}
            visible={showAlert}
          />
        )}
      </View>
    </ErrorBoundary>
  );
}
