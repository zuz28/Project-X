import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '../styles/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  padded?: boolean;
}

export function Card({ children, style, elevated = false, padded = true }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        padded && styles.padded,
        elevated && styles.elevated,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  padded: {
    padding: Spacing.lg,
  },
  elevated: {
    ...Shadows.md,
    borderWidth: 0,
  },
});
