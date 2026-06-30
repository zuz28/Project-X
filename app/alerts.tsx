import { View, Text, TouchableOpacity, ScrollView, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../store';

export default function AlertsScreen() {
  const router = useRouter();
  const { currentSession, sessions } = useStore();

  const allImpacts = [
    ...(currentSession?.impacts || []),
    ...sessions.flatMap(s => s.impacts),
  ];

  const flaggedImpacts = allImpacts.filter(i => i.flagged).sort((a, b) => b.timestamp - a.timestamp);

  const renderAlert = ({ item }) => (
    <TouchableOpacity
      style={styles.alertCard}
      onPress={() => router.push(`/impact/${item.id}`)}
    >
      <View style={styles.alertIcon}>
        <Text style={styles.alertEmoji}>⚠️</Text>
      </View>
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>High Impact Detected</Text>
        <Text style={styles.alertDescription}>
          {item.gForce}G impact at {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
        <Text style={styles.alertSeverity}>Risk threshold exceeded</Text>
      </View>
      <Text style={styles.alertChevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Alerts</Text>
      </View>

      {flaggedImpacts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>✓</Text>
          <Text style={styles.emptyTitle}>All Clear</Text>
          <Text style={styles.emptyText}>No flagged impacts yet</Text>
        </View>
      ) : (
        <FlatList
          data={flaggedImpacts}
          renderItem={renderAlert}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
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
  list: {
    padding: 20,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  alertIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffe5e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertEmoji: {
    fontSize: 24,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  alertDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  alertSeverity: {
    fontSize: 12,
    color: '#ff6b6b',
    marginTop: 6,
    fontWeight: '500',
  },
  alertChevron: {
    fontSize: 20,
    color: '#999',
    marginLeft: 8,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
});
