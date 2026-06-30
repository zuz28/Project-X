import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useStore } from '../store';
import { useHelmet } from '../hooks/useHelmet';
import { generateSession } from '../services/mockImpacts';

export default function HomeScreen() {
  const router = useRouter();
  const { currentSession, isConnected } = useStore();
  const { createNewSession } = useHelmet();

  useEffect(() => {
    if (!currentSession) {
      const newSession = generateSession();
      createNewSession(newSession);
    }
  }, []);

  const handleStartSession = () => {
    const newSession = generateSession();
    createNewSession(newSession);
  };

  const handleConnect = () => {
    router.push('/pair');
  };

  if (!currentSession) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  const maxImpact = currentSession.impacts.reduce((max, impact) =>
    impact.gForce > max ? impact.gForce : max, 0);
  const flaggedCount = currentSession.impacts.filter(i => i.flagged).length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vela</Text>
        <Text style={styles.subtitle}>Session #{currentSession.id.substring(0, 8)}</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Impacts</Text>
          <Text style={styles.statValue}>{currentSession.impacts.length}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Max G-Force</Text>
          <Text style={styles.statValue}>{maxImpact.toFixed(1)}G</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Flagged</Text>
          <Text style={[styles.statValue, flaggedCount > 0 && styles.warning]}>
            {flaggedCount}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, isConnected && styles.buttonConnected]}
        onPress={handleConnect}
      >
        <Text style={styles.buttonText}>
          {isConnected ? '✓ Helmet Connected' : 'Connect Helmet'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonSecondary} onPress={handleStartSession}>
        <Text style={styles.buttonSecondaryText}>Start New Session</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Impacts</Text>
        {currentSession.impacts.slice(0, 5).map((impact) => (
          <TouchableOpacity
            key={impact.id}
            style={styles.impactItem}
            onPress={() => router.push(`/impact/${impact.id}`)}
          >
            <View>
              <Text style={styles.impactForce}>{impact.gForce}G</Text>
              <Text style={styles.impactTime}>
                {new Date(impact.timestamp).toLocaleTimeString()}
              </Text>
            </View>
            {impact.flagged && <Text style={styles.flag}>⚠️</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.nav}>
        <TouchableOpacity onPress={() => router.push('/history')}>
          <Text style={styles.navLink}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/alerts')}>
          <Text style={styles.navLink}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/account')}>
          <Text style={styles.navLink}>Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loading: {
    flex: 1,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  statsCard: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  warning: {
    color: '#ff6b6b',
  },
  button: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonConnected: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#e5e5e5',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  impactItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  impactForce: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  impactTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  flag: {
    fontSize: 20,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    marginBottom: 40,
  },
  navLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
