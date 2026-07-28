import React from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { SentriDock, TabItem } from '@/components/ui/SentriDock';

const PRO_TABS: TabItem[] = [
  { key: 'home', label: 'Home', icon: 'home', route: '/(pro)/home' },
  { key: 'jobs', label: 'Jobs', icon: 'briefcase', route: '/(pro)/jobs' },
  { key: 'score', label: 'Score', icon: 'shield-checkmark', route: '/(pro)/score' },
  { key: 'account', label: 'Account', icon: 'user', route: '/(pro)/account' },
];

export default function ProfessionalLayout() {
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
        <Stack.Screen name="jobs" />
        <Stack.Screen name="score" />
        <Stack.Screen name="account" />
      </Stack>

      <SentriDock tabs={PRO_TABS} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
