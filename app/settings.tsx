import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Switch, Alert } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useStore } from '../store';
import { bleService } from '../services/ble';
import { exportSessionsAsCSV, generateReport } from '../services/export';
import { logger } from '../utils/logger';
import { Colors, Spacing, Radius, Typography, Animation, Shadows } from '../styles/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { isConnected, connectedDeviceName, setConnected, setConnectedDeviceName, setConnectedHelmetId, clearAll, sessions, user, logout } = useStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [impactThreshold, setImpactThreshold] = useState(40);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: async () => {
            if (isConnected) {
              await bleService.disconnectDevice();
            }
            logout();
            router.replace('/auth/login');
          },
          style: 'destructive',
        },
      ]
    );
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: Animation.normal,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await bleService.disconnectDevice();
      setConnected(false);
      setConnectedDeviceName(null);
      setConnectedHelmetId(null);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This action cannot be undone. Are you sure?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Clear',
          onPress: () => {
            clearAll();
            Alert.alert('Success', 'All data has been cleared');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleExportData = () => {
    try {
      const csv = exportSessionsAsCSV(sessions);
      const report = generateReport(sessions);

      Alert.alert(
        'Export Generated',
        'Your data has been exported. You can now share or save it.\n\nCSV file is ready to copy.',
        [
          {
            text: 'OK',
            onPress: () => logger.info('Data exported successfully', {}, 'SETTINGS'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Settings</Text>
          </View>
        </View>

        {/* User Profile Section */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.profileBox}>
              <View style={styles.profileIcon}>
                <Text style={styles.profileIconText}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user.name}</Text>
                <Text style={styles.profileEmail}>{user.email}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Device Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device</Text>
          <View style={styles.sectionBox}>
            {isConnected && connectedDeviceName ? (
              <>
                <View style={styles.deviceRow}>
                  <View>
                    <Text style={styles.deviceLabel}>Connected Device</Text>
                    <Text style={styles.deviceValue}>{connectedDeviceName}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusDot}>●</Text>
                    <Text style={styles.statusText}>Active</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.disconnectButton}
                  onPress={handleDisconnect}
                  disabled={isDisconnecting}
                  activeOpacity={0.7}
                >
                  <Text style={styles.disconnectButtonText}>
                    {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.noDeviceText}>No device connected</Text>
                <TouchableOpacity
                  style={styles.connectDeviceButton}
                  onPress={() => router.push('/connect')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.connectDeviceButtonText}>Connect Device</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionBox}>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Enable Notifications</Text>
                <Text style={styles.settingDescription}>Alerts for high-impact events</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: Colors.border, true: Colors.accentGreen }}
                thumbColor={Colors.background}
              />
            </View>

            <View style={[styles.settingRow, styles.settingBorder]}>
              <View>
                <Text style={styles.settingLabel}>Impact Threshold</Text>
                <Text style={styles.settingDescription}>Notify when impact exceeds {impactThreshold}G</Text>
              </View>
            </View>

            <View style={styles.thresholdButtons}>
              {[30, 40, 50, 60].map(threshold => (
                <TouchableOpacity
                  key={threshold}
                  style={[
                    styles.thresholdButton,
                    impactThreshold === threshold && styles.thresholdButtonActive,
                  ]}
                  onPress={() => setImpactThreshold(threshold)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.thresholdButtonText,
                      impactThreshold === threshold && styles.thresholdButtonTextActive,
                    ]}
                  >
                    {threshold}G
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={styles.sectionBox}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleExportData}
              activeOpacity={0.7}
            >
              <View>
                <Text style={styles.settingLabel}>Export Data</Text>
                <Text style={styles.settingDescription}>Download all session data as CSV</Text>
              </View>
              <Text style={styles.settingArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Sign Out</Text>
          <View style={[styles.sectionBox, styles.dangerBox]}>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={styles.dangerButtonText}>Sign Out</Text>
            </TouchableOpacity>
            <Text style={styles.dangerDescription}>You will be returned to the login screen</Text>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
          <View style={[styles.sectionBox, styles.dangerBox]}>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleClearData}
              activeOpacity={0.7}
            >
              <Text style={styles.dangerButtonText}>Clear All Data</Text>
            </TouchableOpacity>
            <Text style={styles.dangerDescription}>This action cannot be undone</Text>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.sectionBox}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>App Version</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={[styles.aboutRow, styles.aboutBorder]}>
              <Text style={styles.aboutLabel}>Build</Text>
              <Text style={styles.aboutValue}>001</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  closeButton: {
    fontSize: Typography.size.xl,
    color: Colors.text,
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.size['2xl'],
    fontWeight: '700',
    color: Colors.text,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  sectionTitle: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dangerTitle: {
    color: Colors.accentRed,
  },
  sectionBox: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  deviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  deviceLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  deviceValue: {
    fontSize: Typography.size.base,
    color: Colors.text,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    gap: Spacing.xs,
  },
  statusDot: {
    fontSize: 8,
    color: Colors.accentGreen,
  },
  statusText: {
    fontSize: Typography.size.xs,
    color: Colors.text,
    fontWeight: '600',
  },
  disconnectButton: {
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  disconnectButtonText: {
    color: Colors.accentRed,
    fontSize: Typography.size.base,
    fontWeight: '600',
  },
  noDeviceText: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
  },
  connectDeviceButton: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  connectDeviceButtonText: {
    color: Colors.background,
    fontSize: Typography.size.base,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  settingBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLabel: {
    fontSize: Typography.size.base,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  settingDescription: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  settingArrow: {
    fontSize: Typography.size.lg,
    color: Colors.textTertiary,
  },
  thresholdButtons: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  thresholdButton: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  thresholdButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  thresholdButtonText: {
    fontSize: Typography.size.sm,
    color: Colors.text,
    fontWeight: '600',
  },
  thresholdButtonTextActive: {
    color: Colors.background,
  },
  dangerBox: {
    backgroundColor: Colors.accentRed,
  },
  dangerButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: Colors.background,
    fontSize: Typography.size.base,
    fontWeight: '600',
  },
  dangerDescription: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    fontSize: Typography.size.xs,
    color: Colors.background,
    opacity: 0.8,
    textAlign: 'center',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  aboutBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  aboutLabel: {
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  aboutValue: {
    fontSize: Typography.size.base,
    color: Colors.text,
    fontWeight: '600',
  },
  profileBox: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  profileIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconText: {
    fontSize: Typography.size['2xl'],
    fontWeight: '700',
    color: Colors.background,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  profileEmail: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
  },
});
