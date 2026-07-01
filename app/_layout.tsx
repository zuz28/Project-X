import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useStore } from '../store';
import { getSessions } from '../services/storage';

export default function RootLayout() {
  const { setSessions } = useStore();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const sessions = await getSessions();
      setSessions(sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  return (
    <>
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
      </Stack>
    </>
  );
}
