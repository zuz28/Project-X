import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { clearSessions } from '../services/db';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AccountScreen() {
  const router = useRouter();
  const { userId, setUserId, clearAll } = useStore();
  const [notifications, setNotifications] = useState(true);
  const [dataSync, setDataSync] = useState(true);
  const [showClearWarning, setShowClearWarning] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const notif = await AsyncStorage.getItem('notifications');
      const sync = await AsyncStorage.getItem('dataSync');
      setNotifications(notif !== 'false');
      setDataSync(sync !== 'false');
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    setNotifications(value);
    try {
      await AsyncStorage.setItem('notifications', value.toString());
    } catch (error) {
      console.error('Failed to save preference:', error);
    }
  };

  const handleDataSyncToggle = async (value: boolean) => {
    setDataSync(value);
    try {
      await AsyncStorage.setItem('dataSync', value.toString());
    } catch (error) {
      console.error('Failed to save preference:', error);
    }
  };

  const handleClearData = async () => {
    try {
      await clearSessions();
      clearAll();
      setShowClearWarning(false);
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  };

  const handleLogout = () => {
    setUserId(null);
    clearAll();
    router.push('/');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Account</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.card}>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>User ID</Text>
              <Text style={styles.profileValue}>{userId || 'Not set'}</Text>
            </View>
            <View style={[styles.profileRow, styles.noBorder]}>
              <Text style={styles.profileLabel}>App Version</Text>
              <Text style={styles.profileValue}>1.0.0</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Impact Alerts</Text>
                <Text style={styles.settingDescription}>
                  Notify when high impacts are detected
                </Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={handleNotificationsToggle}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Cloud Sync</Text>
                <Text style={styles.settingDescription}>
                  Sync your data to cloud backup
                </Text>
              </View>
              <Switch value={dataSync} onValueChange={handleDataSyncToggle} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={() => setShowClearWarning(true)}
          >
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
          <Text style={styles.dangerDescription}>
            This will permanently delete all sessions and impacts from your device.
          </Text>
        </View>

        {showClearWarning && (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>Are you sure?</Text>
            <Text style={styles.warningText}>
              This action cannot be undone. All your session data will be permanently deleted.
            </Text>
            <View style={styles.warningButtons}>
              <TouchableOpacity
                style={styles.warningCancel}
                onPress={() => setShowClearWarning(false)}
              >
                <Text style={styles.warningCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.warningConfirm}
                onPress={handleClearData}
              >
                <Text style={styles.warningConfirmText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
  },
  backButton: {
    color: '#007AFF',
    fontSize: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  profileLabel: {
    fontSize: 14,
    color: '#666',
  },
  profileValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#999',
  },
  dangerButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff6b6b',
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '600',
  },
  dangerDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  warningCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  warningButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  warningCancel: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#e5e5e5',
    alignItems: 'center',
  },
  warningCancelText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '600',
  },
  warningConfirm: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#ff6b6b',
    alignItems: 'center',
  },
  warningConfirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
