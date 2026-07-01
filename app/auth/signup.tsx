import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, TextInput } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useStore } from '../../store';
import { authService } from '../../services/auth';
import { Colors, Spacing, Radius, Typography, Animation } from '../../styles/theme';

export default function SignupScreen() {
  const router = useRouter();
  const { setUser } = useStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: Animation.normal,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSendCode = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (authService.emailExists(email)) {
      setError('An account with this email already exists');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await authService.sendVerificationEmail(email, 'signup');
      setStep('verify');
    } catch (err) {
      setError('Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const user = await authService.verifyAndSignup(
        email,
        verificationCode,
        name,
        password
      );
      setUser(user);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.icon}>🏛️</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Vela today</Text>
        </View>

        {/* Details Step */}
        {step === 'details' && (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor={Colors.textTertiary}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setError('');
                }}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••"
                placeholderTextColor={Colors.textTertiary}
                secureTextEntry
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                editable={!isLoading}
              />
              <Text style={styles.hint}>At least 6 characters</Text>
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Creating...' : 'Continue'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Verify Step */}
        {step === 'verify' && (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Verification Code</Text>
              <Text style={styles.description}>
                We sent a 6-digit code to {email}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="000000"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="number-pad"
                maxLength={6}
                value={verificationCode}
                onChangeText={(text) => {
                  setVerificationCode(text.replace(/[^0-9]/g, ''));
                  setError('');
                }}
                editable={!isLoading}
              />
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleVerifyCode}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Verifying...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setStep('details');
                setVerificationCode('');
                setError('');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.link}>Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')} activeOpacity={0.7}>
            <Text style={styles.link}>Sign in</Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['2xl'],
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  icon: {
    fontSize: 56,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.size['3xl'],
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
  },
  form: {
    marginBottom: Spacing['2xl'],
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
  },
  hint: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.size.base,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.background,
    fontSize: Typography.size.base,
    fontWeight: '600',
  },
  link: {
    color: Colors.primary,
    fontSize: Typography.size.base,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  error: {
    color: Colors.accentRed,
    fontSize: Typography.size.sm,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
  },
});
