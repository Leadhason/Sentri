import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriButton } from '@/components/ui/SentriButton';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { TacticalCard } from '@/components/ui/TacticalCard';
import { Icon } from '@/components/ui/Icon';

export default function AssessmentCompleteSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = (params.jobId as string) || 'JOB-7294';

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack={false} rightIcon="notifications" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Celebration Header */}
        <View style={styles.successIconBox}>
          <View style={styles.avatarAssembly}>
            <View style={styles.radarRing} />
            <View style={styles.iconRing}>
              <Icon name="shield-checkmark" size={38} color={Colors.gold} />
            </View>
          </View>

          <SentriText variant="monoSmall" color={Colors.gold} style={styles.stepTag}>
            SECURITY DETAIL DISPATCHED
          </SentriText>

          <SentriText variant="h1" align="center" style={styles.successHeading}>
            Assessment Complete!
          </SentriText>

          <SentriText variant="body" color={Colors.textSecondary} align="center" style={styles.successSubtitle}>
            Your security team has been assigned and notified. Paystack Escrow hold is active.
          </SentriText>
        </View>

        {/* Dispatch Summary Ticket Card */}
        <TacticalCard
          backgroundColor={Colors.surface}
          borderColor={Colors.gold}
          accentColor={Colors.gold}
          style={styles.summaryCard}
        >
          <View style={styles.detailRow}>
            <SentriText variant="monoSmall" color={Colors.textSecondary}>DISPATCH REFERENCE</SentriText>
            <SentriText variant="mono" color={Colors.gold} style={styles.refCode}>
              {jobId.startsWith('JOB') ? jobId : `JOB-${jobId.substring(0, 8).toUpperCase()}`}
            </SentriText>
          </View>

          <View style={styles.detailRow}>
            <SentriText variant="monoSmall" color={Colors.textSecondary}>ASSIGNED OPERATIVES</SentriText>
            <SentriText variant="body" color={Colors.text}>2x VIP Bodyguards + 2x Event Officers</SentriText>
          </View>

          <View style={styles.detailRow}>
            <SentriText variant="monoSmall" color={Colors.textSecondary}>COVERAGE LOCATION</SentriText>
            <SentriText variant="body" color={Colors.text}>Labadi Beach Resort, Accra</SentriText>
          </View>

          <View style={styles.detailRow}>
            <SentriText variant="monoSmall" color={Colors.textSecondary}>SHIFT DURATION</SentriText>
            <SentriText variant="body" color={Colors.text}>18:00 - 02:00 (8 Hours)</SentriText>
          </View>

          <View style={styles.detailRow}>
            <SentriText variant="monoSmall" color={Colors.textSecondary}>PAYSTACK ESCROW</SentriText>
            <SentriText variant="mono" color={Colors.textSuccess}>GHS 3,280.00 HELD SECURELY</SentriText>
          </View>
        </TacticalCard>

        {/* 3-Step What Happens Next Progress Section */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            WHAT HAPPENS NEXT
          </SentriText>
        </View>

        <TacticalCard backgroundColor={Colors.surface} style={styles.timelineCard}>
          <View style={styles.timelineItem}>
            <View style={styles.stepCircleActive}>
              <Icon name="checkmark" size={14} color={Colors.background} />
            </View>
            <View style={styles.stepContent}>
              <SentriText variant="h3" style={styles.stepTitle}>1. Team Assigned & Notified</SentriText>
              <SentriText variant="caption" color={Colors.textSecondary}>Operatives have accepted dispatch parameters.</SentriText>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.stepCircleNext}>
              <SentriText variant="caption" color={Colors.gold} style={styles.stepNum}>2</SentriText>
            </View>
            <View style={styles.stepContent}>
              <SentriText variant="h3" style={styles.stepTitle}>2. Live Geofence Monitoring</SentriText>
              <SentriText variant="caption" color={Colors.textSecondary}>Active GPS tracking opens 15 minutes prior to shift start.</SentriText>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.stepCircleFuture}>
              <SentriText variant="caption" color={Colors.textMuted} style={styles.stepNum}>3</SentriText>
            </View>
            <View style={styles.stepContent}>
              <SentriText variant="h3" color={Colors.textMuted} style={styles.stepTitle}>3. Shift Completion & Escrow Release</SentriText>
              <SentriText variant="caption" color={Colors.textMuted}>Funds released only upon your final hours approval.</SentriText>
            </View>
          </View>
        </TacticalCard>

        {/* Primary Navigation Actions */}
        <View style={styles.actionSection}>
          <SentriButton
            title="TRACK LIVE DISPATCH →"
            variant="primary"
            size="md"
            onPress={() => router.replace('/(client)/home/active/44444444-4444-4444-4444-444444444441' as any)}
            style={styles.btnSpacing}
          />

          <SentriButton
            title="RETURN TO DASHBOARD"
            variant="secondary"
            size="md"
            onPress={() => router.replace('/(client)/home' as any)}
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
  successIconBox: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  avatarAssembly: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  radarRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: Colors.badgeBorder,
  },
  iconRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.badgeBg,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTag: {
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 4,
  },
  successHeading: {
    fontSize: 26,
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
  },
  summaryCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refCode: {
    fontSize: 15,
  },
  sectionHeader: {
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1,
  },
  timelineCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepCircleActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepCircleNext: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.badgeBg,
    borderWidth: 1,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepCircleFuture: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNum: {
    fontWeight: '700',
    fontSize: 11,
  },
  stepContent: {
    flex: 1,
    gap: 2,
  },
  stepTitle: {
    fontSize: 15,
  },
  actionSection: {
    marginTop: Spacing.xs,
  },
  btnSpacing: {
    marginBottom: Spacing.sm,
  },
});
