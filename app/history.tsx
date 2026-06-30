import { View, Text, TouchableOpacity, ScrollView, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../store';

export default function HistoryScreen() {
  const router = useRouter();
  const { sessions } = useStore();

  const renderSession = ({ item }) => {
    const maxImpact = item.impacts.reduce((max, impact) =>
      impact.gForce > max ? impact.gForce : max, 0);
    const flaggedCount = item.impacts.filter(i => i.flagged).length;

    return (
      <TouchableOpacity
        style={styles.sessionCard}
        onPress={() => router.push(`/impact/${item.id}`)}
      >
        <View>
          <Text style={styles.sessionDate}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
          <Text style={styles.sessionTime}>
            {new Date(item.date).toLocaleTimeString()}
          </Text>
        </View>
        <View style={styles.sessionStats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Impacts</Text>
            <Text style={styles.statValue}>{item.impacts.length}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Max</Text>
            <Text style={styles.statValue}>{maxImpact.toFixed(1)}G</Text>
          </View>
          {flaggedCount > 0 && (
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Flagged</Text>
              <Text style={[styles.statValue, styles.warning]}>{flaggedCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>History</Text>
      </View>

      {sessions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No sessions yet</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSession}
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
  sessionCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  sessionTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  sessionStats: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 4,
  },
  warning: {
    color: '#ff6b6b',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
