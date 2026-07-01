import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useStore } from '../../store';
import { generateSession } from '../../services/mockData';
import { addSession } from '../../services/storage';
import { Colors, Spacing, Radius, Typography, Animation, Shadows } from '../../styles/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { currentSession, setCurrentSession, addImpact } = useStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!currentSession) {
      const session = generateSession();
      setCurrentSession(session);
      addSession(session);
    }

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: Animation.normal,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleNewSession = async () => {
    const session = generateSession();
    setCurrentSession(session);
    await addSession(session);
  };

  if (!currentSession) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const maxG = Math.max(...currentSession.impacts.map(i => i.gForce), 50);
  const flaggedCount = currentSession.impacts.filter(i => i.flagged).length;
  const avgG = (currentSession.impacts.reduce((sum, i) => sum + i.gForce, 0) / currentSession.impacts.length).toFixed(1);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Vela</Text>
          <Text style={styles.headerSubtitle}>Session Tracking</Text>
        </View>

        {/* Main Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard label="Impacts" value={currentSession.impacts.length.toString()} />
          <StatCard label="Max G" value={maxG.toFixed(1)} />
          <StatCard label="Avg G" value={avgG} />
          <StatCard label="Flagged" value={flaggedCount.toString()} highlight={flaggedCount > 0} />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.7}>
            <Text style={styles.primaryButtonText}>Connect Helmet</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleNewSession}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>New Session</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Impacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Impacts</Text>
          {currentSession.impacts.slice(0, 5).map((impact, index) => (
            <TouchableOpacity
              key={impact.id}
              style={[styles.impactRow, index !== currentSession.impacts.slice(0, 5).length - 1 && styles.impactBorder]}
              onPress={() => router.push(`/impact/${impact.id}`)}
              activeOpacity={0.7}
            >
              <View>
                <Text style={styles.impactG}>{impact.gForce}G</Text>
                <Text style={styles.impactTime}>
                  {new Date(impact.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              {impact.flagged && <Text style={styles.flagIcon}>⚠️</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>
        {value}
      </Text>
    </View>
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
    fontSize: Typography.size['5xl'],
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  headerSubtitle: {
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.size.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  statValueHighlight: {
    color: Colors.accentRed,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadows.md,
  },
  primaryButtonText: {
    color: Colors.background,
    fontSize: Typography.size.base,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    color: Colors.text,
    fontSize: Typography.size.base,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  impactBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  impactG: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  impactTime: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
  flagIcon: {
    fontSize: 18,
  },
  loadingText: {
    fontSize: Typography.size.lg,
    color: Colors.textTertiary,
  },
});
