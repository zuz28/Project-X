import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import { Colors, Spacing, Typography, Animation } from '../styles/theme';

export function LoadingScreen() {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.icon,
          {
            transform: [{ rotate: spin }, { scale: pulseAnim }],
          },
        ]}
      >
        🏛️
      </Animated.Text>
      <Text style={styles.title}>Vela</Text>
      <Text style={styles.subtitle}>Initializing...</Text>
      <View style={styles.dotsContainer}>
        <Animated.View style={styles.dot} />
        <Animated.View style={[styles.dot, { marginLeft: Spacing.sm }]} />
        <Animated.View style={[styles.dot, { marginLeft: Spacing.sm }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  icon: {
    fontSize: 56,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.size['5xl'],
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
    marginBottom: Spacing.lg,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});
