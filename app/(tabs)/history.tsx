import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useStore } from '../../store';
import { Colors, Spacing, Radius, Typography, Animation, Shadows } from '../../styles/theme';

export default function HistoryScreen() {
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

  const handleSessionPress = (sessionId: string) => {
    router.push(`/session/${sessionId}`);
  };

  if (sessions.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>No Sessions</Text>
        <Text style={styles.emptySubtext}>Start tracking impacts to see history</Text>
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
          <Text style={styles.headerTitle}>Session History</Text>
        </View>

        {/* Sessions List */}
        <View style={styles.section}>
          {sessions.map((session, index) => (
            <TouchableOpacity
              key={session.id}
              style={[
                styles.sessionRow,
                index !== sessions.length - 1 && styles.sessionBorder,
              ]}
              onPress={() => handleSessionPress(session.id)}
              activeOpacity={0.7}
            >
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionDate}>
                  {new Date(session.date).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={styles.sessionTime}>
                  {new Date(session.date).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View style={styles.sessionStats}>
                <View style={styles.statBadge}>
                  <Text style={styles.statLabel}>Impacts</Text>
                  <Text style={styles.statValue}>{session.impacts.length}</Text>
                </View>
                <View style={styles.statBadge}>
                  <Text style={styles.statLabel}>Max G</Text>
                  <Text style={styles.statValue}>
                    {Math.max(...session.impacts.map(i => i.gForce), 50).toFixed(1)}
                  </Text>
                </View>
                <View style={styles.statBadge}>
                  <Text style={styles.statLabel}>Flagged</Text>
                  <Text style={[styles.statValue, session.impacts.filter(i => i.flagged).length > 0 && styles.flaggedText]}>
                    {session.impacts.filter(i => i.flagged).length}
                  </Text>
                </View>
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
  },
  section: {
    paddingHorizontal: Spacing.lg,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  sessionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  sessionTime: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
  sessionStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statBadge: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  statValue: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  flaggedText: {
    color: Colors.accentRed,
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
