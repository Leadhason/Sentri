import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriButton } from '@/components/ui/SentriButton';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { TacticalCard } from '@/components/ui/TacticalCard';
import { Icon } from '@/components/ui/Icon';
import { apiClient } from '@/lib/apiClient';

export default function ConfirmDispatchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookingId = (params.id as string) || 'req_101';

  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleConfirmDuty = async () => {
    if (!agreed) return;

    setErrorMsg('');
    setLoading(true);

    try {
      if (!bookingId.startsWith('req_')) {
        await apiClient.put(`/api/bookings/${bookingId}/accept`);
      }
      setLoading(false);
      router.replace('/(pro)/jobs' as any);
    } catch (e: any) {
      setLoading(false);
      // Fallback transition for demo/testing
      router.replace('/(pro)/jobs' as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack rightIcon={undefined} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <SentriText variant="monoSmall" color={Colors.gold} style={styles.stepTag}>
            FINAL DISPATCH CONFIRMATION
          </SentriText>
          <SentriText variant="h1" style={styles.mainHeading}>
            Review & Initiate Duty
          </SentriText>
          <SentriText variant="body" color={Colors.textSecondary}>
            Confirm your operational parameters before activating geofenced shift monitoring.
          </SentriText>
        </View>

        {/* Operation Ticket Card */}
        <TacticalCard
          backgroundColor={Colors.surface}
          borderColor={Colors.gold}
          accentColor={Colors.gold}
          style={styles.opCard}
        >
          <View style={styles.opHeader}>
            <View>
              <SentriText variant="monoSmall" color={Colors.textSecondary}>OPERATION ID</SentriText>
              <SentriText variant="mono" color={Colors.gold}>OP-77A-9284</SentriText>
            </View>
            <View style={styles.statusBadge}>
              <SentriText variant="monoSmall" color={Colors.textSuccess}>APPROVED</SentriText>
            </View>
          </View>

          <View style={styles.detailGrid}>
            <View style={styles.gridItem}>
              <SentriText variant="monoSmall" color={Colors.textSecondary}>ASSIGNMENT</SentriText>
              <SentriText variant="body" color={Colors.text}>Perimeter Security</SentriText>
            </View>

            <View style={styles.gridItem}>
              <SentriText variant="monoSmall" color={Colors.textSecondary}>EXPECTED PAY</SentriText>
              <SentriText variant="mono" color={Colors.gold}>GHS 720.00</SentriText>
            </View>

            <View style={styles.gridItem}>
              <SentriText variant="monoSmall" color={Colors.textSecondary}>SHIFT HOURS</SentriText>
              <SentriText variant="body" color={Colors.text}>18:00 - 00:00 (6 Hrs)</SentriText>
            </View>

            <View style={styles.gridItem}>
              <SentriText variant="monoSmall" color={Colors.textSecondary}>GEOFENCE SECTOR</SentriText>
              <SentriText variant="body" color={Colors.text}>Labadi Beach Resort</SentriText>
            </View>
          </View>
        </TacticalCard>

        {/* Protocol Agreement Checkbox */}
        <TouchableOpacity
          style={styles.agreeRow}
          onPress={() => setAgreed(!agreed)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
            {agreed && <Icon name="checkmark" size={12} color={Colors.background} />}
          </View>
          <SentriText variant="caption" color={Colors.textSecondary} style={styles.agreeText}>
            I confirm readiness to report to sector 15 minutes prior to shift start with active background GPS location enabled.
          </SentriText>
        </TouchableOpacity>

        {/* Action Button */}
        <View style={styles.actionSection}>
          <SentriButton
            title="Confirm & Initiate Active Duty →"
            variant="primary"
            size="md"
            loading={loading}
            disabled={!agreed}
            onPress={handleConfirmDuty}
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
    marginBottom: 4,
  },
  opCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  opHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: Colors.successMuted,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  detailGrid: {
    gap: 12,
  },
  gridItem: {
    gap: 2,
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: Spacing.md,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  agreeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  actionSection: {
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
});
