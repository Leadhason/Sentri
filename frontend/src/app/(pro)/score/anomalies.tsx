import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { TacticalCard } from '@/components/ui/TacticalCard';
import { Icon } from '@/components/ui/Icon';

export default function AnomalyHistoryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack rightIcon={undefined} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <SentriText variant="monoSmall" color={Colors.gold} style={styles.stepTag}>
            AUDIT LOG & APPEALS
          </SentriText>
          <SentriText variant="h1" style={styles.mainHeading}>
            Anomaly History
          </SentriText>
        </View>

        {/* Overview Stats */}
        <View style={styles.statsRow}>
          <TacticalCard backgroundColor={Colors.surface} style={styles.statBox}>
            <SentriText variant="monoSmall" color={Colors.textSecondary}>PENDING APPEALS</SentriText>
            <SentriText variant="h1" color={Colors.gold}>0</SentriText>
          </TacticalCard>

          <TacticalCard backgroundColor={Colors.surface} style={styles.statBox}>
            <SentriText variant="monoSmall" color={Colors.textSecondary}>RESOLVED (30D)</SentriText>
            <SentriText variant="h1" color={Colors.textSuccess}>2</SentriText>
          </TacticalCard>
        </View>

        {/* Anomaly Items */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.uppercaseLabel}>
            SYSTEM AUDIT LOGS
          </SentriText>
        </View>

        <TacticalCard
          backgroundColor={Colors.surface}
          borderColor={Colors.border}
          accentColor={Colors.success}
          style={styles.logCard}
        >
          <View style={styles.logTop}>
            <View style={styles.logTitleGroup}>
              <Icon name="location" size={16} color={Colors.success} />
              <SentriText variant="h3" style={styles.logTitle}>
                Geofence Boundary Departure
              </SentriText>
            </View>
            <View style={styles.resolvedPill}>
              <SentriText variant="monoSmall" color={Colors.textSuccess}>RESOLVED</SentriText>
            </View>
          </View>

          <SentriText variant="caption" color={Colors.textSecondary} style={styles.logDesc}>
            500m location deviation flagged during Airport Escort shift. Explanation accepted by admin audit.
          </SentriText>
        </TacticalCard>

        <TacticalCard
          backgroundColor={Colors.surface}
          borderColor={Colors.border}
          accentColor={Colors.success}
          style={styles.logCard}
        >
          <View style={styles.logTop}>
            <View style={styles.logTitleGroup}>
              <Icon name="time" size={16} color={Colors.success} />
              <SentriText variant="h3" style={styles.logTitle}>
                Passive Inactivity Check
              </SentriText>
            </View>
            <View style={styles.resolvedPill}>
              <SentriText variant="monoSmall" color={Colors.textSuccess}>RESOLVED</SentriText>
            </View>
          </View>

          <SentriText variant="caption" color={Colors.textSecondary} style={styles.logDesc}>
            30-minute inactivity check-in prompt acknowledged successfully.
          </SentriText>
        </TacticalCard>
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
  headerSection: {
    marginVertical: Spacing.md,
  },
  stepTag: {
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  mainHeading: {
    fontSize: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.md,
  },
  statBox: {
    flex: 1,
    padding: Spacing.md,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  uppercaseLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  logCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  logTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  logTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logTitle: {
    fontSize: 15,
  },
  resolvedPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: Colors.successMuted,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  logDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
});
