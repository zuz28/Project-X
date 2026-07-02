// Minimal Whoop-style bar chart built from plain Views.
// Bars are blue by default and shift to orange/red when the session's
// max G crosses the high/critical thresholds.
import { View, Text, StyleSheet } from 'react-native';
import type { Session } from '../store';
import { Colors, Spacing, Radius, Typography } from '../styles/theme';

const CHART_HEIGHT = 120;
const MAX_BARS = 7;

function barColor(maxG: number): string {
  if (maxG > 60) return Colors.accentRed;
  if (maxG > 40) return Colors.accentOrange;
  return Colors.primary;
}

export function SessionBarChart({ sessions }: { sessions: Session[] }) {
  // Oldest → newest, most recent MAX_BARS sessions
  const recent = sessions.slice(0, MAX_BARS).reverse();
  const maxCount = Math.max(1, ...recent.map((s) => s.impacts.length));

  if (recent.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No session data yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.bars}>
        {recent.map((session) => {
          const count = session.impacts.length;
          const maxG = count > 0 ? Math.max(...session.impacts.map((i) => i.gForce)) : 0;
          const height = Math.max(6, (count / maxCount) * CHART_HEIGHT);
          const day = new Date(session.date).toLocaleDateString([], {
            month: 'numeric',
            day: 'numeric',
          });

          return (
            <View key={session.id} style={styles.barColumn}>
              <Text style={styles.barValue}>{count}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    { height, backgroundColor: barColor(maxG) },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{day}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.legend}>
        <LegendDot color={Colors.primary} label="Normal" />
        <LegendDot color={Colors.accentOrange} label="High G" />
        <LegendDot color={Colors.accentRed} label="Critical G" />
      </View>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  bars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barValue: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  barTrack: {
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 18,
    borderRadius: Radius.sm,
  },
  barLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    fontWeight: '500',
    marginTop: Spacing.sm,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  empty: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing['2xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
  },
});
