import React, { useEffect } from 'react';
import { View, ViewStyle, Animated, StyleSheet } from 'react-native';
import { Colors, Radius } from '../styles/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = Radius.md,
  style,
}: SkeletonProps) {
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

interface SkeletonListProps {
  count?: number;
  height?: number;
  gap?: number;
}

export function SkeletonList({ count = 5, height = 60, gap = 12 }: SkeletonListProps) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ marginBottom: gap }}>
          <Skeleton height={height} />
        </View>
      ))}
    </View>
  );
}

interface SkeletonCardProps {
  count?: number;
}

export function SkeletonCard({ count = 4 }: SkeletonCardProps) {
  return (
    <View style={styles.card}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ marginBottom: 12 }}>
          <Skeleton height={16} width={i === 0 ? '60%' : '100%'} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.backgroundSecondary,
  },
  card: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: Radius.lg,
  },
});
