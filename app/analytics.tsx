import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../store';
import { calculateSessionStats, calculateTrendStats, formatDuration } from '../utils/analytics';
import { StatsCard } from '../components/StatsCard';

export default function AnalyticsScreen() {
  const router = useRouter();
  const { sessions, currentSession } = useStore();

  const currentStats = currentSession ? calculateSessionStats(currentSession) : null;
  const trendStats = calculateTrendStats(sessions);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Analytics</Text>
      </View>

      {currentSession && currentStats && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Session</Text>
            <View style={styles.card}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Impacts</Text>
                <Text style={styles.statValue}>{currentStats.totalImpacts}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Max G-Force</Text>
                <Text style={styles.statValue}>{currentStats.maxGForce.toFixed(1)}G</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Avg G-Force</Text>
                <Text style={styles.statValue}>{currentStats.avgGForce.toFixed(1)}G</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Max Rotational</Text>
                <Text style={styles.statValue}>{currentStats.maxRotational}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue}>{formatDuration(currentStats.duration)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Flagged Impacts</Text>
                <Text style={[styles.statValue, currentStats.flaggedCount > 0 && styles.warning]}>
                  {currentStats.flaggedCount} ({currentStats.riskPercentage.toFixed(0)}%)
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Severity</Text>
                <Text style={[styles.statValue, styles[`severity_${currentStats.severity}`]]}>
                  {currentStats.severity.charAt(0).toUpperCase() + currentStats.severity.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overall Trends</Text>
        <View style={styles.card}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Sessions</Text>
            <Text style={styles.statValue}>{trendStats.sessionCount}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Avg Impacts/Session</Text>
            <Text style={styles.statValue}>{trendStats.avgImpactsPerSession.toFixed(1)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Flagged</Text>
            <Text style={[styles.statValue, trendStats.totalFlaggedImpacts > 0 && styles.warning]}>
              {trendStats.totalFlaggedImpacts}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>High Risk Sessions</Text>
            <Text style={[styles.statValue, trendStats.highRiskSessions > 0 && styles.warning]}>
              {trendStats.highRiskSessions}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Tips</Text>
        <View style={styles.tipsCard}>
          <Text style={styles.tip}>
            • Impacts consistently above 60G may indicate concussion risk
          </Text>
          <Text style={styles.tip}>
            • Rotational acceleration is as important as G-force
          </Text>
          <Text style={styles.tip}>
            • Multiple impacts in short timeframe increase risk
          </Text>
          <Text style={styles.tip}>
            • Always consult medical professionals for serious impacts
          </Text>
          <Text style={styles.tip}>
            • Keep detailed records for medical evaluation
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
  },
  backButton: {
    color: '#007AFF',
    fontSize: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  warning: {
    color: '#ff6b6b',
  },
  severity_low: {
    color: '#34C759',
  },
  severity_moderate: {
    color: '#ffc107',
  },
  severity_high: {
    color: '#ff6b6b',
  },
  tipsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  tip: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
});
