import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, ActivityIndicator, FlatList } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useStore } from '../store';
import { bleService, BluetoothDevice } from '../services/ble';
import { Colors, Spacing, Radius, Typography, Animation, Shadows } from '../styles/theme';

export default function ConnectScreen() {
  const router = useRouter();
  const { setConnected, setConnectedDeviceName } = useStore();
  const [isScanning, setIsScanning] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<BluetoothDevice[]>([
    { id: 'device-1', name: 'Vela Helmet Pro', rssi: -45, isConnected: false },
    { id: 'device-2', name: 'Vela Helmet X', rssi: -62, isConnected: false },
    { id: 'device-3', name: 'Vela Helmet Lite', rssi: -78, isConnected: false },
  ]);
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: Animation.normal,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleStartScan = async () => {
    setIsScanning(true);
    try {
      await bleService.startScanning();
      // Simulate finding devices
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnect = async (device: BluetoothDevice) => {
    setConnectingTo(device.id);
    try {
      await bleService.connectToDevice(device.id, device.name);
      setConnected(true);
      setConnectedDeviceName(device.name);

      // Simulate success feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      router.back();
    } catch (error) {
      console.error('Connection failed:', error);
      setConnectingTo(null);
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
            <Text style={styles.headerTitle}>Connect Helmet</Text>
            <Text style={styles.headerSubtitle}>Pair your Vela helmet to get started</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsBox}>
          <Text style={styles.instructionStep}>1. Turn on your Vela helmet</Text>
          <Text style={styles.instructionStep}>2. Make sure Bluetooth is enabled on your device</Text>
          <Text style={styles.instructionStep}>3. Select your helmet from the list below</Text>
          <Text style={styles.instructionStep}>4. Confirm the pairing on your helmet</Text>
        </View>

        {/* Scan Button */}
        <View style={styles.scanButtonContainer}>
          <TouchableOpacity
            style={[styles.scanButton, isScanning && styles.scanButtonActive]}
            onPress={handleStartScan}
            disabled={isScanning}
            activeOpacity={0.7}
          >
            {isScanning ? (
              <>
                <ActivityIndicator color={Colors.background} size="small" />
                <Text style={styles.scanButtonText}>Scanning...</Text>
              </>
            ) : (
              <>
                <Text style={styles.scanButtonIcon}>🔍</Text>
                <Text style={styles.scanButtonText}>Scan for Devices</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Available Devices */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Devices</Text>
          {availableDevices.length > 0 ? (
            <View style={styles.devicesList}>
              {availableDevices.map((device, index) => (
                <TouchableOpacity
                  key={device.id}
                  style={[
                    styles.deviceRow,
                    index !== availableDevices.length - 1 && styles.deviceBorder,
                  ]}
                  onPress={() => handleConnect(device)}
                  disabled={connectingTo !== null}
                  activeOpacity={0.7}
                >
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <View style={styles.signalContainer}>
                      <Text style={styles.signalLabel}>Signal: {device.rssi} dBm</Text>
                      <View style={styles.signalBars}>
                        <Text style={styles.signalBar}>▮</Text>
                        <Text style={[styles.signalBar, device.rssi > -60 && styles.signalBarActive]}>▮</Text>
                        <Text style={[styles.signalBar, device.rssi > -45 && styles.signalBarActive]}>▮</Text>
                      </View>
                    </View>
                  </View>
                  {connectingTo === device.id ? (
                    <ActivityIndicator color={Colors.primary} size="small" />
                  ) : (
                    <View style={styles.connectArrow}>
                      <Text>→</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No devices found</Text>
              <Text style={styles.emptyStateSubtext}>Tap "Scan for Devices" to search</Text>
            </View>
          )}
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need help?</Text>
          <Text style={styles.helpText}>• Make sure your Vela helmet is charged and turned on</Text>
          <Text style={styles.helpText}>• Keep your helmet within 10 meters of your phone</Text>
          <Text style={styles.helpText}>• Try scanning again if devices don't appear</Text>
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
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  closeButton: {
    fontSize: Typography.size.xl,
    color: Colors.text,
    fontWeight: '600',
    paddingTop: Spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.size['2xl'],
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  instructionsBox: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  instructionStep: {
    fontSize: Typography.size.base,
    color: Colors.text,
    marginBottom: Spacing.md,
    fontWeight: '500',
  },
  scanButtonContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  scanButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
    flexDirection: 'row',
    gap: Spacing.md,
  },
  scanButtonActive: {
    opacity: 0.8,
  },
  scanButtonIcon: {
    fontSize: 20,
  },
  scanButtonText: {
    color: Colors.background,
    fontSize: Typography.size.base,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  devicesList: {
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
  },
  deviceBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  signalLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  signalBars: {
    flexDirection: 'row',
    gap: 2,
  },
  signalBar: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  signalBarActive: {
    color: Colors.primary,
  },
  connectArrow: {
    fontSize: Typography.size.lg,
    color: Colors.primary,
  },
  emptyState: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
  },
  helpSection: {
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  helpTitle: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  helpText: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
});
