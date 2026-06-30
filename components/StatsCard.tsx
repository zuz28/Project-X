import { View, Text, StyleSheet } from 'react-native';

interface Stat {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}

interface StatsCardProps {
  stats: Stat[];
}

export function StatsCard({ stats }: StatsCardProps) {
  return (
    <View style={styles.card}>
      {stats.map((stat, index) => (
        <View key={index} style={[styles.stat, index > 0 && styles.divider]}>
          <Text style={styles.label}>{stat.label}</Text>
          <View style={styles.valueContainer}>
            <Text style={[styles.value, stat.color && { color: stat.color }]}>
              {stat.value}
            </Text>
            {stat.unit && <Text style={styles.unit}>{stat.unit}</Text>}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    borderLeftWidth: 1,
    borderLeftColor: '#f0f0f0',
    paddingLeft: 16,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  unit: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
});
