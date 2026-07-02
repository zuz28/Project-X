import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useStore } from '../../store';
import { generateSession } from '../../services/mockData';
import { addSession } from '../../services/storage';
import { Colors, Spacing, Radius, Typography, Animation, Shadows } from '../../styles/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { currentSession, addSession: addSessionToStore, isConnected, connectedDeviceName, user } = useStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!currentSession) {
      const session = generateSession();
      // Store action updates both currentSession and the sessions list;
      // the storage call persists it to disk.
      addSessionToStore(session);
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
    addSessionToStore(session);
    await addSession(session);
  };

  const handleConnectPress = () => {
    router.push('/connect');
  };

  // Memoize stats calculations (must run before any early return — Rules of Hooks)
  const { maxG, flaggedCount, avgG } = useMemo(() => {
    const impacts = currentSession?.impacts || [];
    return {
      maxG: impacts.length > 0 ? Math.max(...impacts.map(i => i.gForce)) : 0,
      flaggedCount: impacts.filter(i => i.flagged).length,
      avgG: impacts.length > 0
        ? (impacts.reduce((sum, i) => sum + i.gForce, 0) / impacts.length).toFixed(1)
        : '0',
    };
  }, [currentSession?.impacts]);

  if (!currentSession) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Loading...</Text>
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
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Vela</Text>
              <Text style={styles.headerSubtitle}>Session Tracking</Text>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push('/settings')}
              activeOpacity={0.7}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
          {isConnected && connectedDeviceName && (
            <Text style={styles.deviceName}>{connectedDeviceName}</Text>
          )}
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
          <TouchableOpacity
            testID="connect-helmet-button"
            accessible
            accessibilityLabel={isConnected ? 'Helmet connected' : 'Connect helmet'}
            accessibilityHint="Opens device pairing screen"
            style={[styles.primaryButton, isConnected && styles.primaryButtonConnected]}
            onPress={handleConnectPress}
            activeOpacity={0.7}
          >
            <Text style={styles.primaryButtonIcon}>
              {isConnected ? '✓' : '🔗'}
            </Text>
            <Text style={styles.primaryButtonText}>
              {isConnected ? 'Helmet Connected' : 'Connect Helmet'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="new-session-button"
            accessible
            accessibilityLabel="New session"
            style={styles.secondaryButton}
            onPress={handleNewSession}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>New Session</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="health-insights-button"
            accessible
            accessibilityLabel="Health insights"
            style={styles.insightsButton}
            onPress={() => router.push('/insights')}
            activeOpacity={0.7}
          >
            <Text style={styles.insightsButtonIcon}>💡</Text>
            <Text style={styles.insightsButtonText}>Health Insights</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="your-helmets-button"
            accessible
            accessibilityLabel="Your helmets"
            style={styles.helmetButton}
            onPress={() => router.push('/helmet')}
            activeOpacity={0.7}
          >
            <Text style={styles.helmetButtonIcon}>🪖</Text>
            <Text style={styles.helmetButtonText}>Your Helmets</Text>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
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
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    gap: Spacing.xs,
  },
  connectionDot: {
    fontSize: 8,
    color: Colors.accentGreen,
  },
  connectionText: {
    fontSize: Typography.size.xs,
    color: Colors.text,
    fontWeight: '600',
  },
  deviceName: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  settingsButton: {
    padding: Spacing.sm,
  },
  settingsIcon: {
    fontSize: Typography.size.xl,
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
    justifyContent: 'center',
    ...Shadows.md,
    flexDirection: 'row',
    gap: Spacing.md,
  },
  primaryButtonConnected: {
    backgroundColor: Colors.accentGreen,
  },
  primaryButtonIcon: {
    fontSize: Typography.size.base,
    color: Colors.background,
    fontWeight: '600',
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
  insightsButton: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  insightsButtonIcon: {
    fontSize: 16,
  },
  insightsButtonText: {
    color: Colors.primary,
    fontSize: Typography.size.base,
    fontWeight: '600',
  },
  helmetButton: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  helmetButtonIcon: {
    fontSize: 16,
  },
  helmetButtonText: {
    color: Colors.primary,
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
