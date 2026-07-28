import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriButton } from '@/components/ui/SentriButton';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { TacticalCard } from '@/components/ui/TacticalCard';
import { Icon } from '@/components/ui/Icon';

export default function PostJobConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = (params.jobId as string) || 'JOB-88492';

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack={false} rightIcon={undefined} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success Icon Mark */}
        <View style={styles.successIconBox}>
          <View style={styles.iconRing}>
            <Icon name="shield-checkmark" size={36} color={Colors.gold} />
          </View>
          <SentriText variant="h1" align="center" style={styles.successHeading}>
            Dispatch Confirmed
          </SentriText>
          <SentriText variant="body" color={Colors.textSecondary} align="center" style={styles.successSubtitle}>
            Your security team has been dispatched and notified. Funds are securely locked in Paystack Escrow.
          </SentriText>
        </View>

        {/* Dispatch Summary Ticket */}
        <TacticalCard
          backgroundColor={Colors.surface}
          borderColor={Colors.gold}
          accentColor={Colors.gold}
          style={styles.summaryCard}
        >
          <View style={styles.detailRow}>
            <SentriText variant="monoSmall" color={Colors.textSecondary}>DISPATCH ID</SentriText>
            <SentriText variant="mono" color={Colors.gold}>
              {jobId.startsWith('JOB') ? jobId : `JOB-${jobId.substring(0, 8).toUpperCase()}`}
            </SentriText>
          </View>

          <View style={styles.detailRow}>
            <SentriText variant="monoSmall" color={Colors.textSecondary}>SECURITY TEAM</SentriText>
            <SentriText variant="body" color={Colors.text}>4 Guards Assigned</SentriText>
          </View>

          <View style={styles.detailRow}>
            <SentriText variant="monoSmall" color={Colors.textSecondary}>PAYSTACK ESCROW</SentriText>
            <SentriText variant="mono" color={Colors.textSuccess}>HELD (GHS 1,440.00)</SentriText>
          </View>

          <View style={styles.detailRow}>
            <SentriText variant="monoSmall" color={Colors.textSecondary}>PASSED GEOFENCE</SentriText>
            <SentriText variant="mono" color={Colors.gold}>ACCRA CENTRAL</SentriText>
          </View>
        </TacticalCard>

        {/* Navigation Action Buttons */}
        <View style={styles.actionSection}>
          <SentriButton
            title="View Live Activity Feed →"
            variant="primary"
            size="md"
            onPress={() => router.replace('/(client)/activity' as any)}
            style={styles.btnSpacing}
          />

          <SentriButton
            title="Return to Dashboard"
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
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(240, 167, 59, 0.15)',
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  successHeading: {
    fontSize: 26,
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  summaryCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionSection: {
    alignItems: 'center',
    gap: 12,
  },
  btnSpacing: {
    width: '100%',
  },
});
