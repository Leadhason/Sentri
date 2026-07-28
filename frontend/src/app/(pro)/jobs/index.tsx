import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriButton } from '@/components/ui/SentriButton';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { TacticalCard } from '@/components/ui/TacticalCard';
import { Icon } from '@/components/ui/Icon';

export default function ActiveJobMonitorScreen() {
  const router = useRouter();
  const [checkedIn, setCheckedIn] = useState(false);

  const handleCheckin = () => {
    setCheckedIn(true);
    setTimeout(() => setCheckedIn(false), 3000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack={false} rightIcon="notifications" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Live Active Shift Hero Panel */}
        <TacticalCard
          backgroundColor={Colors.surface}
          borderColor={Colors.gold}
          accentColor={Colors.gold}
          style={styles.heroCard}
        >
          <View style={styles.heroCenter}>
            <View style={styles.liveTag}>
              <View style={styles.pulseDot} />
              <SentriText variant="monoSmall" color={Colors.gold}>
                ACTIVE DEPLOYMENT // GEOFENCED
              </SentriText>
            </View>

            <SentriText variant="h1" color={Colors.text} style={styles.shiftTimer}>
              03:42:15
            </SentriText>

            <View style={styles.taskPill}>
              <SentriText variant="caption" color={Colors.textSecondary}>
                Labadi Beach Event Guarding
              </SentriText>
            </View>
          </View>
        </TacticalCard>

        {/* Geofence Location Audit Status */}
        <TacticalCard backgroundColor={Colors.surface} style={styles.geofenceCard}>
          <View style={styles.geofenceRow}>
            <View style={styles.geofenceLeft}>
              <Icon name="location" size={20} color={Colors.textSuccess} />
              <View>
                <SentriText variant="monoSmall" color={Colors.textSuccess}>
                  INSIDE GEOFENCE SECTOR
                </SentriText>
                <SentriText variant="caption" color={Colors.textSecondary}>
                  Last automated check-in 4 mins ago (30 min interval)
                </SentriText>
              </View>
            </View>
          </View>
        </TacticalCard>

        {/* Tactical Actions Grid */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.uppercaseLabel}>
            TACTICAL SHIFT ACTIONS
          </SentriText>
        </View>

        <View style={styles.actionsGrid}>
          <SentriButton
            title="Log Incident Report →"
            variant="danger"
            size="md"
            iconLeft="alert-circle"
            onPress={() => router.push('/shared/log-incident' as any)}
            style={styles.actionBtn}
          />

          <SentriButton
            title={checkedIn ? 'Check-in Verified ✓' : 'Manual Guard Check-in'}
            variant="primary"
            size="md"
            iconLeft="checkmark"
            onPress={handleCheckin}
            style={styles.actionBtn}
          />

          <SentriButton
            title="Call Client Host"
            variant="secondary"
            size="md"
            iconLeft="call"
            onPress={() => router.push('/shared/call' as any)}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 100,
  },
  heroCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  heroCenter: {
    alignItems: 'center',
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.xs,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gold,
  },
  shiftTimer: {
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '700',
    letterSpacing: 2,
    marginVertical: Spacing.xs,
  },
  taskPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  geofenceCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  geofenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  geofenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sectionHeader: {
    marginBottom: Spacing.xs,
  },
  uppercaseLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  actionsGrid: {
    gap: Spacing.md,
  },
  actionBtn: {
    width: '100%',
  },
});
