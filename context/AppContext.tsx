import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppSettings {
  notificationsEnabled: boolean;
  cloudSyncEnabled: boolean;
  darkModeEnabled: boolean;
  impactThresholdG: number;
  impactThresholdRotational: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  cloudSyncEnabled: false,
  darkModeEnabled: false,
  impactThresholdG: 60,
  impactThresholdRotational: 6000,
};

interface AppContextType {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('@vela_app_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    try {
      const updated = { ...settings, ...updates };
      setSettings(updated);
      await AsyncStorage.setItem('@vela_app_settings', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppSettings must be used within AppProvider');
  }
  return context;
}
