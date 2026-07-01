import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useStore } from '../store';
import { getSessions } from '../services/storage';
import { bleService } from '../services/ble';
import { ImpactAlert } from '../components/ImpactAlert';

export default function RootLayout() {
  const { setSessions, addImpact, currentSession } = useStore();
  const [lastImpact, setLastImpact] = useState<any>(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    loadSessions();
    setupBLEListener();
  }, []);

  const loadSessions = async () => {
    try {
      const sessions = await getSessions();
      setSessions(sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const setupBLEListener = () => {
    // Listen for incoming impact data from BLE
    const unsubscribe = bleService.onImpact((impactData) => {
      if (currentSession) {
        const impact = {
          id: `impact-${Date.now()}`,
          timestamp: impactData.timestamp,
          gForce: impactData.gForce,
          rotational: impactData.rotational,
          flagged: impactData.gForce > 50, // Flag high impacts automatically
        };

        addImpact(impact);
        setLastImpact(impact);
        setShowAlert(true);
      }
    });

    return () => unsubscribe();
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Stack
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
          animationTypeForReplace: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="impact/[id]"
          options={{
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="connect"
          options={{
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="session/[id]"
          options={{
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="insights"
          options={{
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
      {lastImpact && (
        <ImpactAlert
          gForce={lastImpact.gForce}
          timestamp={lastImpact.timestamp}
          visible={showAlert}
        />
      )}
    </View>
  );
}
