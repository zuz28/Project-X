import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useStore } from '../store';
import { getSessions } from '../services/db';

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
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="history" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="alerts" />
      <Stack.Screen name="pair" />
      <Stack.Screen name="account" />
      <Stack.Screen name="impact/[id]" />
    </Stack>
  );
}
