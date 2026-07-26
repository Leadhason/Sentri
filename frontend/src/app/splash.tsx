import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriButton } from '@/components/ui/SentriButton';
import { DiamondAperture } from '@/components/ui/DiamondAperture';

export default function SplashScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        {/* Centered Diamond Mark & SENTRI Brand Title */}
        <View style={styles.centerSection}>
          <DiamondAperture
            size={140}
            pulsing={true}
            floating={true}
            filled={true}
            color={Colors.gold}
          />
          <SentriText variant="h1" style={styles.brandTitle}>
            SENTRI
          </SentriText>
        </View>

        {/* Compact Action Button at Bottom */}
        <View style={styles.actionBox}>
          <SentriButton
            title="Begin Operations →"
            variant="primary"
            size="md"
            onPress={() => router.push('/role-selection' as any)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 32,
    letterSpacing: 8,
    color: Colors.gold,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 36,
  },
  actionBox: {
    width: '100%',
    maxWidth: 320,
    marginBottom: Spacing.md,
  },
});
