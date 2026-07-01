import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useStore } from '../store';
import { helmetService, Helmet } from '../services/helmet';
import { Colors, Spacing, Radius, Typography, Animation, Shadows } from '../styles/theme';

export default function HelmetScreen() {
  const router = useRouter();
  const { connectedHelmetId } = useStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [helmets, setHelmets] = useState<Helmet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: Animation.normal,
      useNativeDriver: true,
    }).start();

    loadHelmets();
  }, []);

  const loadHelmets = async () => {
    try {
      setLoading(true);
      setError(null);
      const allHelmets = helmetService.getAllHelmets();
      setHelmets(allHelmets);
    } catch (err: any) {
      setError(err.message || 'Failed to load helmets');
    } finally {
      setLoading(false);
    }
  };

  const getHelmetHealth = (helmet: Helmet) => {
    const health = helmetService.getHelmetHealth(helmet.id);
    return health;
  };

  if (loading) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Your Helmets</Text>
            </View>
          </View>
          <View style={[styles.container, styles.emptyContainer]}>
            <Text style={styles.emptyDescription}>Loading helmets...</Text>
          </View>
        </ScrollView>
      </Animated.View>
    );
  }

  if (error) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Your Helmets</Text>
            </View>
          </View>
          <View style={[styles.container, styles.emptyContainer]}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={styles.emptyTitle}>Error</Text>
            <Text style={styles.emptyDescription}>{error}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={loadHelmets}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    );
  }

  if (helmets.length === 0) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Your Helmets</Text>
            </View>
          </View>

          <View style={[styles.container, styles.emptyContainer]}>
            <Text style={styles.emptyIcon}>🪖</Text>
            <Text style={styles.emptyTitle}>No Helmets Yet</Text>
            <Text style={styles.emptyDescription}>
              Connect your Vela helmet to start tracking impacts
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/connect')}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Connect Helmet</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
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
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Your Helmets</Text>
          </View>
        </View>

        {/* Helmets List */}
        {helmets.map((helmet) => {
          const health = getHelmetHealth(helmet);
          const isConnected = connectedHelmetId === helmet.id;
          const healthColors = {
            excellent: Colors.accentGreen,
            good: Colors.primary,
            fair: Colors.accentOrange,
            poor: Colors.accentRed,
          };

          return (
            <View key={helmet.id} style={styles.helmetCard}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.helmetName}>{helmet.name}</Text>
                  <Text style={styles.helmetModel}>{helmet.model}</Text>
                </View>
                {isConnected && (
                  <View style={styles.connectedBadge}>
                    <Text style={styles.connectedText}>● Connected</Text>
                  </View>
                )}
              </View>

              {/* Health Status */}
              {health && (
                <View style={[styles.healthBox, { borderLeftColor: healthColors[health.overall] }]}>
                  <View style={styles.healthRow}>
                    <Text style={styles.healthLabel}>Status</Text>
                    <Text
                      style={[
                        styles.healthValue,
                        { color: healthColors[health.overall] },
                      ]}
                    >
                      {health.overall.charAt(0).toUpperCase() + health.overall.slice(1)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Specifications */}
              <View style={styles.specsBox}>
                <SpecRow label="Serial Number" value={helmet.serialNumber} />
                <SpecRow label="Firmware" value={helmet.firmwareVersion} />
                <SpecRow label="Paired Date" value={new Date(helmet.pairedDate).toLocaleDateString()} />
              </View>

              {/* Usage Stats */}
              <View style={styles.statsBox}>
                <StatCard label="Total Impacts" value={helmet.totalImpacts.toString()} />
                <StatCard label="Battery" value={health?.battery ?? 'N/A'} />
                <StatCard label="Connection" value={health?.connection ?? 'Inactive'} />
              </View>

              {/* Recommendations */}
              {health && (
                <View style={styles.recommendationBox}>
                  <Text style={styles.recommendationText}>
                    {health.recommendation}
                  </Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {}}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionButtonText}>Firmware Update</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.dangerButton]}
                  onPress={() => {
                    helmetService.unpairHelmet(helmet.id);
                    loadHelmets();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dangerButtonText}>Unpair</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Add New Helmet */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/connect')}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>+ Add New Helmet</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.specRow}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  header: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  closeButton: {
    fontSize: Typography.size.xl,
    color: Colors.text,
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.size['2xl'],
    fontWeight: '700',
    color: Colors.text,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.size.xl,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  buttonText: {
    color: Colors.background,
    fontSize: Typography.size.base,
    fontWeight: '600',
  },
  helmetCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  helmetName: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  helmetModel: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
  },
  connectedBadge: {
    backgroundColor: Colors.accentGreen,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  connectedText: {
    color: Colors.background,
    fontSize: Typography.size.xs,
    fontWeight: '600',
  },
  healthBox: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderLeftWidth: 4,
    backgroundColor: Colors.background,
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  healthLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  healthValue: {
    fontSize: Typography.size.base,
    fontWeight: '600',
  },
  specsBox: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  specLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  specValue: {
    fontSize: Typography.size.sm,
    color: Colors.text,
    fontWeight: '600',
  },
  statsBox: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.text,
  },
  recommendationBox: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  recommendationText: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  actionButtonText: {
    color: Colors.background,
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.accentRed,
  },
  dangerButtonText: {
    color: Colors.accentRed,
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
  addButton: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  addButtonText: {
    color: Colors.primary,
    fontSize: Typography.size.base,
    fontWeight: '600',
  },
});
