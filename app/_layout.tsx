import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useStore } from '../store';
import { getSessions } from '../services/storage';
import { bleService } from '../services/ble';
import { crashReportingService } from '../services/crashReporting';
import { ImpactAlert } from '../components/ImpactAlert';
import { NetworkStatusBar } from '../components/NetworkStatusBar';
import { ErrorBoundary } from '../utils/errorBoundary';
import { logger } from '../utils/logger';

export default function RootLayout() {
  const { isAuthenticated, setSessions, addImpact, currentSession } = useStore();
  const [lastImpact, setLastImpact] = useState<any>(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Initialize crash reporting
    crashReportingService.initialize('https://your-sentry-dsn@sentry.io/project-id');

    if (isAuthenticated) {
      loadSessions();
      setupBLEListener();
      logger.info('App authenticated', {}, 'APP');
    }
  }, [isAuthenticated]);

  const loadSessions = async () => {
    try {
      const sessions = await getSessions();
      setSessions(sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const setupBLEListener = () => {
    const unsubscribe = bleService.onImpact((impactData) => {
      if (currentSession) {
        const impact = {
          id: `impact-${Date.now()}`,
          timestamp: impactData.timestamp,
          gForce: impactData.gForce,
          rotational: impactData.rotational,
          flagged: impactData.gForce > 50,
        };

        addImpact(impact);
        setLastImpact(impact);
        setShowAlert(true);
      }
    });

    return () => unsubscribe();
  };

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        logger.error('Error Boundary caught', error, 'ROOT_LAYOUT');
      }}
    >
      <View style={{ flex: 1 }}>
        <NetworkStatusBar />
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Stack
          screenOptions={{
            headerShown: false,
            animationEnabled: true,
            animationTypeForReplace: 'fade',
          }}
        >
          {!isAuthenticated ? (
            // Auth Stack
            <Stack.Group>
              <Stack.Screen name="auth/login" />
              <Stack.Screen name="auth/signup" options={{ animationTypeForReplace: 'fade' }} />
              <Stack.Screen name="auth/forgot-password" options={{ animationTypeForReplace: 'fade' }} />
            </Stack.Group>
          ) : (
            // App Stack
            <Stack.Group>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="impact/[id]" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="connect" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="settings" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="helmet" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="session/[id]" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="insights" options={{ animation: 'slide_from_bottom' }} />
            </Stack.Group>
          )}
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
