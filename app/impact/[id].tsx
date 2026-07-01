import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore } from '../../store';
import { getSession } from '../../services/storage';
import { Colors, Spacing, Radius, Typography, Animation, Shadows } from '../../styles/theme';

interface ImpactDetail {
  id: string;
  timestamp: number;
  gForce: number;
  rotational: number;
  flagged: boolean;
  sessionDate: number;
}

export default function ImpactDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { sessions } = useStore();
  const [impact, setImpact] = useState<ImpactDetail | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Find the impact across all sessions
    const foundImpact = sessions
      .flatMap(session =>
        session.impacts.map(impact => ({
          ...impact,
          sessionDate: session.date,
        }))
      )
      .find(imp => imp.id === id);

    if (foundImpact) {
      setImpact(foundImpact as ImpactDetail);
    }

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: Animation.normal,
      useNativeDriver: true,
    }).start();
  }, [id, sessions]);

  if (!impact) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Impact not found</Text>
      </View>
    );
  }

  const severity = impact.gForce > 60 ? 'Critical' : impact.gForce > 40 ? 'High' : 'Normal';
  const severityColor = impact.gForce > 60 ? Colors.accentRed : impact.gForce > 40 ? Colors.accentOrange : Colors.primary;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {/* Header with Main G-Force */}
        <View style={styles.header}>
          <View style={[styles.gForceBadge, { borderColor: severityColor }]}>
            <Text style={[styles.gForceValue, { color: severityColor }]}>
              {impact.gForce}G
            </Text>
            <Text style={[styles.severityLabel, { color: severityColor }]}>
              {severity}
            </Text>
          </View>
          {impact.flagged && (
            <View style={styles.flagBadge}>
              <Text style={styles.flagText}>⚠️ Flagged</Text>
            </View>
          )}
        </View>

        {/* Timestamp */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impact Details</Text>
          <View style={styles.detailBox}>
            <DetailRow
              label="Date"
              value={new Date(impact.timestamp).toLocaleDateString([], {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            />
            <DetailRow
              label="Time"
              value={new Date(impact.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            />
          </View>
        </View>

        {/* Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Measurements</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              label="Linear Acceleration"
              value={`${impact.gForce}G`}
              unit="m/s²"
              color={severityColor}
            />
            <MetricCard
              label="Rotational Force"
              value={`${(impact.rotational / 1000).toFixed(2)}k`}
              unit="rad/s²"
              color={Colors.primary}
            />
          </View>
        </View>

        {/* Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analysis</Text>
          <View style={styles.analysisBox}>
            <Text style={styles.analysisTitle}>
              {impact.gForce > 60
                ? 'High Impact Detected'
                : impact.gForce > 40
                ? 'Moderate Impact'
                : 'Light Impact'}
            </Text>
            <Text style={styles.analysisText}>
              {impact.gForce > 60
                ? 'This impact exceeds safety thresholds and should be reviewed. Consider monitoring for symptoms.'
                : impact.gForce > 40
                ? 'This impact is within concerning range. Monitor for any symptoms of injury.'
                : 'This impact is within normal range.'}
            </Text>
          </View>
        </View>

        {/* Session Reference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session</Text>
          <View style={styles.sessionBox}>
            <Text style={styles.sessionDate}>
              {new Date(impact.sessionDate).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
            <TouchableOpacity
              style={styles.viewSessionButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.viewSessionButtonText}>View Full Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function MetricCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricValueContainer}>
        <Text style={[styles.metricValue, { color }]}>{value}</Text>
        <Text style={styles.metricUnit}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
    paddingBottom: 100,
  },
  backButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButtonText: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.primary,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
    gap: Spacing.md,
  },
  gForceBadge: {
    borderWidth: 2,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  gForceValue: {
    fontSize: Typography.size['4xl'],
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  severityLabel: {
    fontSize: Typography.size.base,
    fontWeight: '600',
  },
  flagBadge: {
    backgroundColor: Colors.accentRed,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  flagText: {
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
  detailBox: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.text,
  },
  metricsGrid: {
    gap: Spacing.md,
  },
  metricCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  metricLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    fontWeight: '500',
    marginBottom: Spacing.md,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  metricValue: {
    fontSize: Typography.size['3xl'],
    fontWeight: '700',
  },
  metricUnit: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  analysisBox: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  analysisTitle: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  analysisText: {
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
    lineHeight: 22,
  },
  sessionBox: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  sessionDate: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  viewSessionButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  viewSessionButtonText: {
    color: Colors.background,
    fontSize: Typography.size.base,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: Typography.size.lg,
    color: Colors.textTertiary,
  },
});
