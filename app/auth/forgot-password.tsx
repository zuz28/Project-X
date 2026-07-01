import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, TextInput } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { authService } from '../../services/auth';
import { Colors, Spacing, Radius, Typography, Animation } from '../../styles/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
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
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!authService.emailExists(email)) {
      setError('No account found with this email');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await authService.sendVerificationEmail(email, 'reset');
      setStep('code');
    } catch (err) {
      setError('Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }
    setStep('password');
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await authService.verifyAndResetPassword(email, verificationCode, newPassword);
      router.replace('/auth/login');
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
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
          <Text style={styles.icon}>🔐</Text>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>We'll help you get back into your account</Text>
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
                  setError('');
                }}
                editable={!isLoading}
              />
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

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
              disabled={isLoading || !verificationCode}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Verify Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setStep('email');
                setVerificationCode('');
                setError('');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.link}>Back to email</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Password Step */}
        {step === 'password' && (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••"
                placeholderTextColor={Colors.textTertiary}
                secureTextEntry
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setError('');
                }}
                editable={!isLoading}
              />
              <Text style={styles.hint}>At least 6 characters</Text>
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Footer */}
        <TouchableOpacity
          onPress={() => router.push('/auth/login')}
          activeOpacity={0.7}
        >
          <Text style={styles.link}>Back to login</Text>
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
});
