import { Tabs } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { Animated, Easing } from 'react-native';
import { Colors, Spacing, Typography } from '../../styles/theme';
import { ErrorBoundary } from '../../utils/errorBoundary';
import { logger } from '../../utils/logger';

export default function TabsLayout() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        logger.error('Tab navigation error', error, 'TABS_LAYOUT');
      }}
    >
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textTertiary,
          tabBarIconStyle: styles.tabBarIcon,
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarLabel: 'History',
          tabBarIcon: ({ color }) => <TabIcon icon="📋" color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color }) => <TabIcon icon="📊" color={color} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color }) => <TabIcon icon="⚠️" color={color} />,
        }}
      />
    </Tabs>
    </ErrorBoundary>
  );
}

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return (
    <Text style={[styles.tabIcon, { color }]}>
      {icon}
    </Text>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Spacing.sm,
    paddingTop: Spacing.md,
    height: 60,
  },
  tabBarLabel: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
    marginTop: Spacing.xs,
  },
  tabBarIcon: {
    marginTop: Spacing.xs,
  },
  tabIcon: {
    fontSize: 20,
  },
});
