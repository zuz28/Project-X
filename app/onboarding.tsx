import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Animation, Shadows } from '../styles/theme';

export default function OnboardingScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Fade in and slide up animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: Animation.normal,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: Animation.normal,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    router.push('/connect');
  };

  const handleSkip = () => {
    router.push('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🏛️</Text>
          </View>
          <Text style={styles.heroTitle}>Welcome to Vela</Text>
          <Text style={styles.heroSubtitle}>
            Advanced impact tracking for athletes
          </Text>
        </Animated.View>

        {/* Features Grid */}
        <Animated.View
          style={[
            styles.featuresGrid,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <FeatureCard
            icon="📊"
            title="Real-time Monitoring"
            description="Track impacts as they happen with your Vela helmet"
          />
          <FeatureCard
            icon="🎯"
            title="Safety Alerts"
            description="Get notified of high-impact events instantly"
          />
          <FeatureCard
            icon="📈"
            title="Analytics"
            description="View detailed statistics and trends over time"
          />
          <FeatureCard
            icon="🔒"
            title="Your Data"
            description="All data stays private and secure on your device"
          />
        </Animated.View>

        {/* Information Section */}
        <Animated.View
          style={[
            styles.infoSection,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.infoTitle}>How it works</Text>
          <StepCard number="1" title="Pair Your Helmet" description="Connect your Vela helmet via Bluetooth" />
          <StepCard number="2" title="Start Tracking" description="Create a new session to begin monitoring" />
          <StepCard number="3" title="Stay Safe" description="Receive alerts for high-impact events" />
          <StepCard number="4" title="Analyze" description="Review your data and insights anytime" />
        </Animated.View>
      </Animated.ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleGetStarted}
          activeOpacity={0.7}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>Skip for Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <View style={styles.featureCard}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['2xl'],
  },
  heroSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['3xl'],
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Spacing['2xl'],
  },
  icon: {
    fontSize: 64,
  },
  heroTitle: {
    fontSize: Typography.size['5xl'],
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: Typography.size.lg,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing['3xl'],
  },
  featureCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: Spacing.md,
  },
  featureTitle: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  infoSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  infoTitle: {
    fontSize: Typography.size['2xl'],
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
    gap: Spacing.lg,
  },
  stepNumber: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: Colors.background,
    fontSize: Typography.size.base,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
    paddingTop: Spacing.sm,
  },
  stepTitle: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  stepDescription: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
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
});
