import React from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { SentriDock, TabItem } from '@/components/ui/SentriDock';

const CLIENT_TABS: TabItem[] = [
  { key: 'home', label: 'Home', icon: 'home', route: '/(client)/home' },
  { key: 'browse', label: 'Browse', icon: 'search', route: '/(client)/browse' },
  { key: 'activity', label: 'Activity', icon: 'activity', route: '/(client)/activity' },
  { key: 'account', label: 'Account', icon: 'user', route: '/(client)/account' },
];

export default function ClientLayout() {
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="home" />
        <Stack.Screen name="browse" />
        <Stack.Screen name="activity" />
        <Stack.Screen name="account" />
      </Stack>

      <SentriDock tabs={CLIENT_TABS} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
