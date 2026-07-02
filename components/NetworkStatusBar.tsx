import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetwork } from '../hooks/useNetwork';
import { Colors, Spacing, Typography } from '../styles/theme';

export function NetworkStatusBar() {
  const { isOnline } = useNetwork();
  const slideAnim = React.useRef(new Animated.Value(isOnline ? -100 : 0)).current;

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOnline ? -100 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOnline, slideAnim]);

  if (isOnline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Ionicons name="cloud-offline-outline" size={18} color={Colors.textOnAccent} />
      <Text style={styles.text}>No internet connection</Text>
      <Text style={styles.subtext}>Some features may be unavailable</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.accentRed,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    flex: 1,
    color: Colors.textOnAccent,
    fontSize: Typography.size.base,
    fontWeight: '600',
  },
  subtext: {
    color: Colors.textOnAccent,
    fontSize: Typography.size.xs,
    opacity: 0.8,
  },
});
