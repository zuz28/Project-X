import { View, Text, StyleSheet, Dimensions } from 'react-native';
import type { Impact } from '../services/mockImpacts';

interface ImpactChartProps {
  impacts: Impact[];
}

export function ImpactChart({ impacts }: ImpactChartProps) {
  const width = Dimensions.get('window').width - 40;
  const height = 120;

  if (impacts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>No data to display</Text>
      </View>
    );
  }

  const maxG = Math.max(...impacts.map(i => i.gForce), 100);
  const threshold = 60;

  const sortedImpacts = [...impacts].sort((a, b) => a.timestamp - b.timestamp);
  const barWidth = Math.max(width / sortedImpacts.length - 2, 2);
  const spacing = width / sortedImpacts.length;

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        {/* Threshold line */}
        <View
          style={[
            styles.thresholdLine,
            {
              bottom: `${(threshold / maxG) * 100}%`,
            },
          ]}
        />

        {/* Bars */}
        <View style={styles.bars}>
          {sortedImpacts.map((impact, index) => {
            const heightPercent = (impact.gForce / maxG) * 100;
            const color = impact.flagged ? '#ff6b6b' : '#007AFF';

            return (
              <View
                key={impact.id}
                style={[
                  styles.bar,
                  {
                    height: `${heightPercent}%`,
                    width: barWidth,
                    marginLeft: index === 0 ? 0 : spacing - barWidth,
                    backgroundColor: color,
                  },
                ]}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#007AFF' }]} />
          <Text style={styles.legendText}>Normal</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#ff6b6b' }]} />
          <Text style={styles.legendText}>Flagged</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.legendThreshold} />
          <Text style={styles.legendText}>Threshold</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  chart: {
    height: 150,
    marginBottom: 16,
    position: 'relative',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    overflow: 'hidden',
  },
  bars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  bar: {
    borderRadius: 2,
  },
  thresholdLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#ffc107',
    zIndex: 1,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendThreshold: {
    width: 12,
    height: 1,
    backgroundColor: '#ffc107',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 24,
  },
});
