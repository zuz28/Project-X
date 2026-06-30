import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { Impact } from '../services/mockImpacts';

interface ImpactCardProps {
  impact: Impact;
  onPress?: () => void;
}

export function ImpactCard({ impact, onPress }: ImpactCardProps) {
  const riskLevel = impact.gForce > 60 ? 'high' : 'normal';
  const riskColor = riskLevel === 'high' ? '#ff6b6b' : '#34C759';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={[styles.indicator, { backgroundColor: riskColor }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.gforce}>{impact.gForce}G</Text>
          {impact.flagged && <Text style={styles.flag}>⚠️</Text>}
        </View>
        <Text style={styles.timestamp}>
          {new Date(impact.timestamp).toLocaleTimeString()}
        </Text>
        <Text style={styles.rotational}>
          Rotational: {impact.rotational} rad/s²
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  indicator: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  gforce: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  flag: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  rotational: {
    fontSize: 11,
    color: '#666',
  },
});
