import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useHelmet } from '../hooks/useHelmet';
import { useStore } from '../store';

export default function PairScreen() {
  const router = useRouter();
  const { startScan, connectToHelmet } = useHelmet();
  const { isConnected } = useStore();
  const [devices, setDevices] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleScan = async () => {
    try {
      setIsScanning(true);
      const found = await startScan();
      setDevices(found);
    } catch (error) {
      console.error('Scan error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnect = async (deviceId: string) => {
    try {
      setConnecting(deviceId);
      await connectToHelmet(deviceId);
      setTimeout(() => router.back(), 1500);
    } catch (error) {
      console.error('Connection error:', error);
      setConnecting(null);
    }
  };

  useEffect(() => {
    handleScan();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Connect Helmet</Text>
      </View>

      <View style={styles.content}>
        {isConnected && (
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successTitle}>Connected</Text>
            <Text style={styles.successText}>Your helmet is now connected</Text>
          </View>
        )}

        <View style={styles.scanSection}>
          <View style={styles.scanHeader}>
            <Text style={styles.scanTitle}>Available Devices</Text>
            {isScanning && <ActivityIndicator color="#007AFF" />}
          </View>

          <TouchableOpacity
            style={[styles.button, isScanning && styles.buttonDisabled]}
            onPress={handleScan}
            disabled={isScanning}
          >
            <Text style={styles.buttonText}>
              {isScanning ? 'Scanning...' : 'Rescan'}
            </Text>
          </TouchableOpacity>

          {devices.length === 0 && !isScanning && (
            <View style={styles.noDevices}>
              <Text style={styles.noDevicesText}>No devices found</Text>
              <Text style={styles.noDevicesHint}>Make sure your helmet is on and nearby</Text>
            </View>
          )}

          {devices.map((device) => (
            <TouchableOpacity
              key={device.id}
              style={styles.deviceCard}
              onPress={() => handleConnect(device.id)}
              disabled={connecting !== null}
            >
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{device.name || 'Unknown Device'}</Text>
                <Text style={styles.deviceId}>{device.id.substring(0, 12)}...</Text>
              </View>
              {connecting === device.id ? (
                <ActivityIndicator color="#007AFF" />
              ) : (
                <Text style={styles.deviceChevron}>›</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How to Connect</Text>
          <Text style={styles.infoStep}>1. Turn on your Vela helmet</Text>
          <Text style={styles.infoStep}>2. Wait for it to appear in the list</Text>
          <Text style={styles.infoStep}>3. Tap to connect</Text>
          <Text style={styles.infoStep}>4. Grant Bluetooth permissions when prompted</Text>
        </View>
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
  successCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  successIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34C759',
    marginBottom: 4,
  },
  successText: {
    fontSize: 14,
    color: '#2e7d32',
  },
  scanSection: {
    marginBottom: 20,
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scanTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deviceCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  deviceId: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  deviceChevron: {
    fontSize: 20,
    color: '#999',
    marginLeft: 8,
  },
  noDevices: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  noDevicesText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  noDevicesHint: {
    fontSize: 12,
    color: '#999',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoStep: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 8,
  },
});
