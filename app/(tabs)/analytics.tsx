import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { useEffect, useRef, useMemo } from 'react';
import { useStore } from '../../store';
import { Colors, Spacing, Radius, Typography, Animation, Shadows } from '../../styles/theme';

export default function AnalyticsScreen() {
  const { sessions, currentSession } = useStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: Animation.normal,
      useNativeDriver: true,
    }).start();
  }, []);

  // Memoize analytics calculations
  const { allImpacts, totalImpacts, totalFlagged, avgG, maxG, minG, avgImpactsPerSession, flaggedPercentage } = useMemo(() => {
    const impacts = sessions.flatMap(s => s.impacts);
    const total = impacts.length;
    const flagged = impacts.filter(i => i.flagged).length;

    return {
      allImpacts: impacts,
      totalImpacts: total,
      totalFlagged: flagged,
      avgG: total > 0 ? (impacts.reduce((sum, i) => sum + i.gForce, 0) / total).toFixed(1) : '0',
      maxG: total > 0 ? Math.max(...impacts.map(i => i.gForce)).toFixed(1) : '0',
      minG: total > 0 ? Math.min(...impacts.map(i => i.gForce)).toFixed(1) : '0',
      avgImpactsPerSession: sessions.length > 0 ? (total / sessions.length).toFixed(1) : '0',
      flaggedPercentage: total > 0 ? ((flagged / total) * 100).toFixed(1) : '0',
    };
  }, [sessions]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSubtitle}>All-time statistics</Text>
        </View>

        {/* Primary Stats */}
        <View style={styles.statsGrid}>
          <StatCard label="Total Impacts" value={totalImpacts.toString()} />
          <StatCard label="Sessions" value={sessions.length.toString()} />
          <StatCard label="Flagged" value={totalFlagged.toString()} highlight={totalFlagged > 0} />
          <StatCard label="Flag Rate" value={`${flaggedPercentage}%`} />
        </View>

        {/* G-Force Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>G-Force Analysis</Text>
          <View style={styles.metricsContainer}>
            <MetricRow label="Average" value={`${avgG}G`} />
            <MetricRow label="Maximum" value={`${maxG}G`} />
            <MetricRow label="Minimum" value={`${minG}G`} />
            <MetricRow label="Per Session" value={avgImpactsPerSession} />
          </View>
        </View>

        {/* Session Information */}
        {currentSession && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Session</Text>
            <View style={styles.currentSessionBox}>
              <Text style={styles.currentSessionDate}>
                Started {new Date(currentSession.date).toLocaleDateString()}
              </Text>
              <Text style={styles.currentSessionImpacts}>
                {currentSession.impacts.length} impacts recorded
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
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
    paddingTop: Spacing.xl,
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  headerTitle: {
    fontSize: Typography.size['3xl'],
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.size.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  statValueHighlight: {
    color: Colors.accentRed,
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
  metricsContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  metricLabel: {
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.text,
  },
  currentSessionBox: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  currentSessionDate: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  currentSessionImpacts: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
  },
});
