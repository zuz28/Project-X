import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useStore } from '../../store';
import { Colors, Spacing, Radius, Typography, Animation, Shadows } from '../../styles/theme';

export default function AlertsScreen() {
  const router = useRouter();
  const { sessions } = useStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: Animation.normal,
      useNativeDriver: true,
    }).start();
  }, []);

  // Get all flagged impacts sorted by recency
  const flaggedImpacts = sessions
    .flatMap(session =>
      session.impacts
        .filter(impact => impact.flagged)
        .map(impact => ({ ...impact, sessionId: session.id, sessionDate: session.date }))
    )
    .sort((a, b) => b.timestamp - a.timestamp);

  const handleImpactPress = (impactId: string) => {
    router.push(`/impact/${impactId}`);
  };

  if (flaggedImpacts.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyIcon}>✓</Text>
        <Text style={styles.emptyText}>No Flagged Impacts</Text>
        <Text style={styles.emptySubtext}>All impacts look normal</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Alerts</Text>
          <Text style={styles.headerSubtitle}>{flaggedImpacts.length} flagged impacts</Text>
        </View>

        {/* Flagged Impacts List */}
        <View style={styles.section}>
          {flaggedImpacts.map((impact, index) => (
            <TouchableOpacity
              key={impact.id}
              style={[
                styles.alertRow,
                index !== flaggedImpacts.length - 1 && styles.alertBorder,
              ]}
              onPress={() => handleImpactPress(impact.id)}
              activeOpacity={0.7}
            >
              <View style={styles.alertIcon}>
                <Text style={styles.alertIconText}>⚠️</Text>
              </View>
              <View style={styles.alertInfo}>
                <Text style={styles.alertG}>{impact.gForce}G Impact</Text>
                <Text style={styles.alertTime}>
                  {new Date(impact.timestamp).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Text style={styles.sessionInfo}>
                  Session: {new Date(impact.sessionDate).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.rotationalBadge}>
                <Text style={styles.rotationalValue}>
                  {(impact.rotational / 1000).toFixed(1)}k
                </Text>
                <Text style={styles.rotationalLabel}>rad/s²</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.xl,
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  headerTitle: {
    fontSize: Typography.size['3xl'],
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
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  alertBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  alertIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertIconText: {
    fontSize: 24,
  },
  alertInfo: {
    flex: 1,
  },
  alertG: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.accentRed,
    marginBottom: Spacing.xs,
  },
  alertTime: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  sessionInfo: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
  rotationalBadge: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  rotationalValue: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  rotationalLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    fontWeight: '500',
    marginTop: Spacing.xs,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.size.xl,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
  },
});
