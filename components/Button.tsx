import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Spacing, Radius, Typography, Shadows } from '../styles/theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  icon?: string;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  icon,
  style,
}: ButtonProps) {
  const variantStyles = {
    primary: styles.primaryButton,
    secondary: styles.secondaryButton,
    danger: styles.dangerButton,
    success: styles.successButton,
  };

  const sizeStyles = {
    small: styles.smallButton,
    medium: styles.mediumButton,
    large: styles.largeButton,
  };

  const textVariantStyles = {
    primary: styles.primaryText,
    secondary: styles.secondaryText,
    danger: styles.dangerText,
    success: styles.successText,
  };

  return (
    <TouchableOpacity
      style={[
        variantStyles[variant],
        sizeStyles[size],
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[textVariantStyles[variant], disabled && styles.disabledText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    ...Shadows.md,
  },
  secondaryButton: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dangerButton: {
    backgroundColor: Colors.accentRed,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    ...Shadows.md,
  },
  successButton: {
    backgroundColor: Colors.accentGreen,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    ...Shadows.md,
  },
  smallButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  mediumButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  largeButton: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing['2xl'],
  },
  primaryText: {
    color: Colors.background,
    fontSize: Typography.size.base,
    fontWeight: '600',
  },
  secondaryText: {
    color: Colors.text,
    fontSize: Typography.size.base,
    fontWeight: '600',
  },
  dangerText: {
    color: Colors.background,
    fontSize: Typography.size.base,
    fontWeight: '600',
  },
  successText: {
    color: Colors.background,
    fontSize: Typography.size.base,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.6,
  },
  icon: {
    fontSize: 16,
  },
});
