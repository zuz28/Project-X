import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, FlatList } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore } from '../../store';
import { Colors, Spacing, Radius, Typography, Animation, Shadows } from '../../styles/theme';

export default function SessionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { sessions } = useStore();
  const [session, setSession] = useState<any>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const foundSession = sessions.find(s => s.id === id);
    if (foundSession) {
      setSession(foundSession);
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: Animation.normal,
      useNativeDriver: true,
    }).start();
  }, [id, sessions]);

  if (!session) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Session not found</Text>
      </View>
    );
  }

  if (session.impacts.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>No impacts recorded</Text>
      </View>
    );
  }

  const sortedImpacts = [...session.impacts].sort((a, b) => b.gForce - a.gForce);
  const maxG = Math.max(...session.impacts.map((i: any) => i.gForce));
  const avgG = (session.impacts.reduce((sum: number, i: any) => sum + i.gForce, 0) / session.impacts.length).toFixed(1);
  const flaggedCount = session.impacts.filter((i: any) => i.flagged).length;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Sticky Header */}
      <View style={styles.stickyHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerDate}>
            {new Date(session.date).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
          <Text style={styles.headerTime}>
            {new Date(session.date).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Stats */}
        <View style={styles.summaryGrid}>
          <SummaryCard label="Total Impacts" value={session.impacts.length.toString()} />
          <SummaryCard label="Max G" value={maxG.toFixed(1)} color={Colors.accentRed} />
          <SummaryCard label="Avg G" value={avgG} />
          <SummaryCard label="Flagged" value={flaggedCount.toString()} color={flaggedCount > 0 ? Colors.accentRed : undefined} />
        </View>

        {/* Top Impacts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Impacts</Text>
          <View style={styles.impactsList}>
            {sortedImpacts.slice(0, 5).map((impact: any, index: number) => (
              <TouchableOpacity
                key={impact.id}
                style={[
                  styles.impactCard,
                  index !== Math.min(4, sortedImpacts.length - 1) && styles.impactCardBorder,
                ]}
                onPress={() => router.push(`/impact/${impact.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.impactRank}>
                  <Text style={styles.impactRankText}>#{index + 1}</Text>
                </View>
                <View style={styles.impactInfo}>
                  <Text style={styles.impactGForce}>{impact.gForce}G</Text>
                  <Text style={styles.impactTime}>
                    {new Date(impact.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </Text>
                </View>
                <View style={styles.impactMeta}>
                  <Text style={styles.rotationalValue}>
                    {(impact.rotational / 1000).toFixed(1)}k rad/s²
                  </Text>
                  {impact.flagged && <Text style={styles.flagIcon}>⚠️</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Detailed Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Analysis</Text>
          <View style={styles.analysisBox}>
            <AnalysisRow label="Session Duration" value="~30 minutes" />
            <AnalysisRow label="Impacts per Minute" value={(session.impacts.length / 30).toFixed(2)} />
            <AnalysisRow label="High-Risk Events" value={flaggedCount.toString()} />
            <AnalysisRow label="Average Impact Interval" value="~45 seconds" />
          </View>
        </View>

        {/* Risk Assessment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Assessment</Text>
          <View style={[styles.riskBox, { borderLeftColor: getRiskColor(maxG) }]}>
            <Text style={styles.riskLevel}>{getRiskLevel(maxG)}</Text>
            <Text style={styles.riskDescription}>
              {getRiskDescription(maxG)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, color && { color }]}>
        {value}
      </Text>
    </View>
  );
}

function AnalysisRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.analysisRow}>
      <Text style={styles.analysisLabel}>{label}</Text>
      <Text style={styles.analysisValue}>{value}</Text>
    </View>
  );
}

function getRiskLevel(maxG: number): string {
  if (maxG > 60) return 'Critical';
  if (maxG > 40) return 'High';
  if (maxG > 25) return 'Moderate';
  return 'Low';
}

function getRiskColor(maxG: number): string {
  if (maxG > 60) return Colors.accentRed;
  if (maxG > 40) return '#FF9500';
  if (maxG > 25) return '#FFB847';
  return Colors.accentGreen;
}

function getRiskDescription(maxG: number): string {
  if (maxG > 60) {
    return 'High impacts detected. Consider medical evaluation and monitoring for symptoms.';
  }
  if (maxG > 40) {
    return 'Significant impacts recorded. Monitor for symptoms and consider rest if needed.';
  }
  if (maxG > 25) {
    return 'Moderate impacts detected. Standard safety precautions recommended.';
  }
  return 'All impacts within safe parameters. Good session.';
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
  stickyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.primary,
  },
  headerDate: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.text,
  },
  headerTime: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    fontSize: Typography.size['2xl'],
    fontWeight: '700',
    color: Colors.text,
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
  impactsList: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  impactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  impactCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  impactRank: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  impactRankText: {
    fontSize: Typography.size.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  impactInfo: {
    flex: 1,
  },
  impactGForce: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  impactTime: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
  impactMeta: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  rotationalValue: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  flagIcon: {
    fontSize: 16,
  },
  analysisBox: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  analysisLabel: {
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  analysisValue: {
    fontSize: Typography.size.base,
    color: Colors.text,
    fontWeight: '600',
  },
  riskBox: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    borderLeftWidth: 4,
    padding: Spacing.lg,
  },
  riskLevel: {
    fontSize: Typography.size.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  riskDescription: {
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
    lineHeight: 22,
  },
  loadingText: {
    fontSize: Typography.size.lg,
    color: Colors.textTertiary,
  },
});
