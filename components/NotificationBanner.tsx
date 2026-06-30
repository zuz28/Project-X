import { View, Text, StyleSheet, TouchableOpacity, Animated, useEffect } from 'react-native';
import type { Notification } from '../utils/notifications';

interface NotificationBannerProps {
  notification: Notification;
  onDismiss?: () => void;
  autoDismiss?: number; // ms
}

export function NotificationBanner({
  notification,
  onDismiss,
  autoDismiss = 5000,
}: NotificationBannerProps) {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (autoDismiss) {
      const timer = setTimeout(onDismiss, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, []);

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'warning':
        return '#ff6b6b';
      case 'connection':
        return '#007AFF';
      default:
        return '#34C759';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'warning':
        return '⚠️';
      case 'connection':
        return '📡';
      default:
        return 'ℹ️';
    }
  };

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          opacity: fadeAnim,
          backgroundColor: getBackgroundColor(),
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{getIcon()}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.message}>{notification.message}</Text>
        </View>
      </View>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  closeButton: {
    fontSize: 18,
    color: '#fff',
    marginLeft: 12,
    fontWeight: '300',
  },
});
