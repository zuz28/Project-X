import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useStore } from '../store';
import { Colors, Spacing, Radius, Typography, Animation, Shadows } from '../styles/theme';

export default function InsightsScreen() {
  const router = useRouter();
  const { sessions, currentSession } = useStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: Animation.normal,
      useNativeDriver: true,
    }).start();
  }, []);

  // Memoize impact calculations
  const { allImpacts, criticalImpacts, highImpacts, todayImpacts, recommendations } = useMemo(() => {
    const impacts = sessions.flatMap(s => s.impacts);
    const critical = impacts.filter(i => i.gForce > 60);
    const high = impacts.filter(i => i.gForce > 40 && i.gForce <= 60);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const today_impacts = impacts.filter(i => new Date(i.timestamp) >= today);

    return {
      allImpacts: impacts,
      criticalImpacts: critical,
      highImpacts: high,
      todayImpacts: today_impacts,
      recommendations: getRecommendations(
        critical.length,
        high.length,
        today_impacts.length,
        impacts.length
      ),
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
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Health Insights</Text>
            <Text style={styles.headerSubtitle}>Personalized recommendations</Text>
          </View>
        </View>

        {/* Health Score */}
        <View style={styles.section}>
          <View style={styles.healthScoreBox}>
            <Text style={styles.scoreLabel}>Overall Health Score</Text>
            <Text style={styles.scoreValue}>
              {getHealthScore(criticalImpacts.length, highImpacts.length)}
            </Text>
            <View style={styles.scoreBar}>
              <View
                style={[
                  styles.scoreBarFill,
                  {
                    width: `${Math.max(
                      0,
                      100 - criticalImpacts.length * 10 - highImpacts.length * 5
                    )}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.scoreDescription}>
              {getHealthMessage(criticalImpacts.length, highImpacts.length)}
            </Text>
          </View>
        </View>

        {/* Risk Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Summary</Text>
          <View style={styles.riskSummaryGrid}>
            <RiskCard
              label="Critical Impacts"
              value={criticalImpacts.length.toString()}
              color={Colors.accentRed}
              icon="🚨"
            />
            <RiskCard
              label="High Impacts"
              value={highImpacts.length.toString()}
              color={Colors.accentOrange}
              icon="⚠️"
            />
            <RiskCard
              label="Today's Impacts"
              value={todayImpacts.length.toString()}
              color={Colors.primary}
              icon="📊"
            />
            <RiskCard
              label="Total Impacts"
              value={allImpacts.length.toString()}
              color={Colors.textTertiary}
              icon="📈"
            />
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          {recommendations.map((rec, index) => (
            <RecommendationCard
              key={index}
              priority={rec.priority}
              title={rec.title}
              description={rec.description}
              action={rec.action}
            />
          ))}
        </View>

        {/* Safety Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Tips</Text>
          <TipCard
            title="Immediate Signs to Watch"
            tips={[
              'Headache or persistent head pressure',
              'Dizziness or balance problems',
              'Nausea or vomiting',
              'Confusion or difficulty concentrating',
              'Sensitivity to light or noise',
            ]}
          />
          <TipCard
            title="Recovery Recommendations"
            tips={[
              'Rest and avoid strenuous activity',
              'Limit screen time',
              'Avoid alcohol',
              'Get adequate sleep',
              'Follow medical guidance',
            ]}
          />
        </View>
      </ScrollView>
    </Animated.View>
  );
}

function RiskCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: string;
}) {
  return (
    <View style={styles.riskCard}>
      <Text style={styles.riskIcon}>{icon}</Text>
      <Text style={styles.riskValue}>{value}</Text>
      <Text style={[styles.riskLabel, { color }]}>{label}</Text>
    </View>
  );
}

function RecommendationCard({
  priority,
  title,
  description,
  action,
}: {
  priority: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  action?: string;
}) {
  const colors = {
    critical: Colors.accentRed,
    high: Colors.accentOrange,
    medium: Colors.primary,
  };

  return (
    <View style={[styles.recommendationCard, { borderLeftColor: colors[priority] }]}>
      <Text style={styles.recommendationTitle}>{title}</Text>
      <Text style={styles.recommendationDescription}>{description}</Text>
      {action && <Text style={styles.recommendationAction}>→ {action}</Text>}
    </View>
  );
}

function TipCard({ title, tips }: { title: string; tips: string[] }) {
  return (
    <View style={styles.tipCard}>
      <Text style={styles.tipTitle}>{title}</Text>
      {tips.map((tip, index) => (
        <Text key={index} style={styles.tipText}>
          • {tip}
        </Text>
      ))}
    </View>
  );
}

function getHealthScore(critical: number, high: number): string {
  const score = Math.max(0, 100 - critical * 20 - high * 5);
  return score.toFixed(0);
}

function getHealthMessage(critical: number, high: number): string {
  if (critical > 0) {
    return 'Critical impacts detected. Seek medical evaluation.';
  }
  if (high >= 3) {
    return 'Multiple high impacts. Consider consulting a healthcare provider.';
  }
  if (high > 0) {
    return 'Moderate risk level. Monitor for symptoms.';
  }
  return 'Your impact profile looks healthy. Keep wearing your helmet!';
}

function getRecommendations(
  critical: number,
  high: number,
  todayImpacts: number,
  totalImpacts: number
): Array<{
  priority: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  action?: string;
}> {
  const recommendations: Array<{
    priority: 'critical' | 'high' | 'medium';
    title: string;
    description: string;
    action?: string;
  }> = [];

  if (critical > 0) {
    recommendations.push({
      priority: 'critical',
      title: 'Immediate Medical Evaluation Needed',
      description: `You've experienced ${critical} critical impact(s) above 60G. Contact a healthcare provider immediately to rule out serious injury.`,
      action: 'Call your doctor',
    });
  }

  if (high >= 3) {
    recommendations.push({
      priority: 'high',
      title: 'Multiple High Impacts Detected',
      description: `${high} high-impact events recorded. Multiple impacts increase injury risk. Consider rest and medical consultation.`,
      action: 'Schedule check-up',
    });
  }

  if (todayImpacts > 5) {
    recommendations.push({
      priority: 'high',
      title: 'High Impact Activity Today',
      description: `${todayImpacts} impacts detected today. Take extra precautions and monitor for symptoms closely.`,
      action: 'Review today\'s session',
    });
  }

  if (totalImpacts > 50 && high > 10) {
    recommendations.push({
      priority: 'medium',
      title: 'Cumulative Impact Exposure',
      description:
        'Your cumulative impact exposure is significant. Consider long-term monitoring and discuss with healthcare provider.',
      action: 'View analytics',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      priority: 'medium',
      title: 'Keep Protecting Your Head',
      description:
        'Your impact profile looks good. Continue wearing your helmet and monitoring your data.',
      action: 'View history',
    });
  }

  return recommendations;
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  header: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  closeButton: {
    fontSize: Typography.size.xl,
    color: Colors.text,
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.size['2xl'],
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  healthScoreBox: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
    fontWeight: '500',
    marginBottom: Spacing.md,
  },
  scoreValue: {
    fontSize: Typography.size['5xl'],
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: Colors.accentGreen,
  },
  scoreDescription: {
    fontSize: Typography.size.base,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  riskSummaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  riskCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  riskIcon: {
    fontSize: 32,
    marginBottom: Spacing.md,
  },
  riskValue: {
    fontSize: Typography.size['2xl'],
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  riskLabel: {
    fontSize: Typography.size.xs,
    fontWeight: '600',
  },
  recommendationCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    borderLeftWidth: 4,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  recommendationTitle: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  recommendationDescription: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  recommendationAction: {
    fontSize: Typography.size.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  tipTitle: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  tipText: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
});
