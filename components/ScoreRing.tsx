// Whoop-style circular score ring: a thin progress arc around a large
// centered number. Color communicates severity; the track stays dark.
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Typography, Spacing } from '../styles/theme';

interface ScoreRingProps {
  score: number; // 0–100
  size?: number;
  strokeWidth?: number;
  label: string;
  sublabel?: string;
}

export function getRingColor(score: number): string {
  if (score < 40) return Colors.accentRed;
  if (score < 70) return Colors.accentOrange;
  return Colors.accentGreen;
}

export function ScoreRing({
  score,
  size = 190,
  strokeWidth = 12,
  label,
  sublabel,
}: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference * (1 - clamped / 100);
  const color = getRingColor(clamped);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.backgroundTertiary}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc, starting from 12 o'clock */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={progress}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.score, { color }]}>{clamped.toFixed(0)}</Text>
        {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: Typography.labelSpacing,
    marginBottom: Spacing.xs,
  },
  score: {
    fontSize: 56,
    fontWeight: '700',
    lineHeight: 60,
  },
  sublabel: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    fontWeight: '500',
    marginTop: Spacing.xs,
  },
});
