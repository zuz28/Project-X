import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useStore } from '../../store';

export default function ImpactDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentSession, sessions } = useStore();

  const allImpacts = [
    ...(currentSession?.impacts || []),
    ...sessions.flatMap(s => s.impacts),
  ];

  const impact = allImpacts.find(i => i.id === id);

  if (!impact) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Impact Detail</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.notFound}>Impact not found</Text>
        </View>
      </View>
    );
  }

  const riskLevel = impact.flagged ? 'High' : 'Low';
  const riskColor = impact.flagged ? '#ff6b6b' : '#34C759';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Impact Detail</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.riskCard, { borderLeftColor: riskColor }]}>
          <Text style={styles.riskLabel}>Risk Level</Text>
          <Text style={[styles.riskValue, { color: riskColor }]}>{riskLevel}</Text>
          {impact.flagged && (
            <Text style={styles.riskNote}>
              This impact crossed the concussion-risk threshold
            </Text>
          )}
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>G-Force</Text>
            <Text style={styles.metricValue}>{impact.gForce}</Text>
            <Text style={styles.metricUnit}>G</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Rotational</Text>
            <Text style={styles.metricValue}>{impact.rotational}</Text>
            <Text style={styles.metricUnit}>rad/s²</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Impact ID</Text>
            <Text style={styles.detailValue}>{impact.id.substring(0, 12)}...</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Timestamp</Text>
            <Text style={styles.detailValue}>
              {new Date(impact.timestamp).toLocaleString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={[styles.detailValue, impact.flagged && styles.flagged]}>
              {impact.flagged ? 'Flagged' : 'Normal'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          {impact.flagged ? (
            <>
              <Text style={styles.recommendation}>
                • Seek medical attention if experiencing symptoms
              </Text>
              <Text style={styles.recommendation}>
                • Monitor for headache, dizziness, or confusion
              </Text>
              <Text style={styles.recommendation}>
                • Rest and avoid strenuous activity
              </Text>
            </>
          ) : (
            <Text style={styles.recommendation}>
              This impact appears to be within normal thresholds. Continue monitoring.
            </Text>
          )}
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
  content: {
    padding: 20,
  },
  riskCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 20,
  },
  riskLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  riskValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  riskNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metric: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  metricUnit: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    color: '#666',
    fontSize: 14,
  },
  detailValue: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '500',
  },
  flagged: {
    color: '#ff6b6b',
  },
  recommendation: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 8,
  },
  notFound: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
