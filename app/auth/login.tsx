import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, TextInput } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Colors, Spacing, Radius, Typography, Animation } from '../../styles/theme';
import { logger } from '../../utils/logger';

export default function LoginScreen() {
  const router = useRouter();
  const { login, sendVerificationCode, error, isLoading, clearError } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [verificationCode, setVerificationCode] = useState('');
  const [localError, setLocalError] = useState('');
  const [demoCode, setDemoCode] = useState('');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: Animation.normal,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSendCode = async () => {
    try {
      setLocalError('');
      const result = await sendVerificationCode(email, 'login');
      setDemoCode(result.demoCode ?? '');
      setStep('code');
      logger.info('Verification code sent', { email }, 'LOGIN');
    } catch (err: any) {
      setLocalError(err.message || 'Failed to send verification code');
      logger.error('Send code failed', err, 'LOGIN');
    }
  };

  const handleVerifyCode = async () => {
    try {
      setLocalError('');
      await login(email, verificationCode);
      logger.info('Login successful', { email }, 'LOGIN');
      router.replace('/(tabs)');
    } catch (err: any) {
      setLocalError(err.message || 'Verification failed');
      logger.error('Login verification failed', err, 'LOGIN');
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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your Vela account</Text>
        </View>

        {/* Email Step */}
        {step === 'email' && (
          <View style={styles.form}>
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
                  setLocalError('');
                  clearError();
                }}
                editable={!isLoading}
              />
            </View>

            {(error || localError) && <Text style={styles.error}>{error || localError}</Text>}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Code Step */}
        {step === 'code' && (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Verification Code</Text>
              <Text style={styles.description}>
                Check your email for the 6-digit code
              </Text>
              {demoCode !== '' && (
                <View style={styles.demoBanner}>
                  <Text style={styles.demoBannerText}>
                    📧 Demo mode — no email service connected yet.{'\n'}Your code: {demoCode}
                  </Text>
                </View>
              )}
              <TextInput
                style={styles.input}
                placeholder="000000"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="number-pad"
                maxLength={6}
                value={verificationCode}
                onChangeText={(text) => {
                  setVerificationCode(text.replace(/[^0-9]/g, ''));
                  setLocalError('');
                  clearError();
                }}
                editable={!isLoading}
              />
            </View>

            {(error || localError) && <Text style={styles.error}>{error || localError}</Text>}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleVerifyCode}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setStep('email');
                setVerificationCode('');
                clearError();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.link}>Back to email</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/signup')} activeOpacity={0.7}>
            <Text style={styles.link}>Sign up</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/auth/forgot-password')}
          activeOpacity={0.7}
        >
          <Text style={styles.link}>Forgot your password?</Text>
        </TouchableOpacity>
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
  demoBanner: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  demoBannerText: {
    fontSize: Typography.size.sm,
    color: Colors.text,
    lineHeight: 20,
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
