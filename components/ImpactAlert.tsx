import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Shadows } from '../styles/theme';

interface ImpactAlertProps {
  gForce: number;
  timestamp: number;
  visible: boolean;
}

export function ImpactAlert({ gForce, timestamp, visible }: ImpactAlertProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const isCritical = gForce > 60;
  const isHigh = gForce > 40;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.alert,
          isCritical && styles.alertCritical,
          isHigh && !isCritical && styles.alertHigh,
        ]}
      >
        <Ionicons
          name={isCritical ? 'alert-circle' : isHigh ? 'warning' : 'pulse'}
          size={24}
          color={isCritical || isHigh ? Colors.textOnAccent : Colors.primary}
        />
        <View style={styles.content}>
          <Text style={[styles.title, (isCritical || isHigh) && styles.lightText]}>Impact Detected</Text>
          <Text style={[styles.gForce, (isCritical || isHigh) && styles.lightText]}>{gForce}G</Text>
        </View>
        <Text style={[styles.severity, (isCritical || isHigh) && styles.lightSeverity]}>
          {isCritical ? 'Critical' : isHigh ? 'High' : 'Normal'}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 1000,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    ...Shadows.lg,
    gap: Spacing.md,
  },
  alertCritical: {
    backgroundColor: Colors.accentRed,
    borderLeftColor: Colors.accentRed,
  },
  alertHigh: {
    backgroundColor: Colors.accentOrange,
    borderLeftColor: Colors.accentOrange,
  },
  lightText: {
    color: Colors.textOnAccent,
  },
  lightSeverity: {
    color: Colors.textOnAccent,
    opacity: 0.9,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  gForce: {
    fontSize: Typography.size.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  severity: {
    fontSize: Typography.size.xs,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
});
