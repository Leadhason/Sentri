import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriButton } from '@/components/ui/SentriButton';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { TacticalCard } from '@/components/ui/TacticalCard';
import { Icon } from '@/components/ui/Icon';
import { apiClient } from '@/lib/apiClient';

export default function ConfirmAndPayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const assessmentId = (params.assessmentId as string) || 'ass_default';

  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'momo' | 'card'>('paystack');
  const [loading, setLoading] = useState(false);

  const handlePaystackEscrowPay = async () => {
    setLoading(true);
    const todayStr = new Date().toISOString().split('T')[0];

    try {
      const res = await apiClient.post<any>(`/api/jobs/from-assessment/${assessmentId}`, {
        date: todayStr,
        title: 'Tactical Escort & Guard Team Deployment',
        minDuration: 4,
        maxDuration: 8,
      });

      setLoading(false);
      router.push({
        pathname: '/(client)/home/assessment/success' as any,
        params: { jobId: res.id || 'JOB-7294' },
      });
    } catch {
      setLoading(false);
      // Fallback transition for demo testing
      router.push({
        pathname: '/(client)/home/assessment/success' as any,
        params: { jobId: 'JOB-' + Math.floor(1000 + Math.random() * 9000) },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack rightIcon="notifications" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Title */}
        <View style={styles.headerSection}>
          <SentriText variant="monoSmall" color={Colors.gold} style={styles.stepTag}>
            BOOKING SUMMARY & CHECKOUT
          </SentriText>
          <SentriText variant="h1" style={styles.mainHeading}>
            Confirm & Pay
          </SentriText>
          <SentriText variant="body" color={Colors.textSecondary}>
            Review your security detail specifications and authorize Paystack Escrow hold.
          </SentriText>
        </View>

        {/* 1. Job Summary Card */}
        <TacticalCard
          backgroundColor={Colors.surface}
          borderColor={Colors.gold}
          accentColor={Colors.gold}
          style={styles.summaryCard}
        >
          <View style={styles.summaryHeader}>
            <View style={styles.specBadge}>
              <Icon name="shield-checkmark" size={16} color={Colors.gold} />
              <SentriText variant="monoSmall" color={Colors.gold}>SECURITY DETAIL SPECIFICATIONS</SentriText>
            </View>
            <View style={styles.statusPill}>
              <SentriText variant="caption" color={Colors.textSuccess}>READY</SentriText>
            </View>
          </View>

          <SentriText variant="h2" style={styles.jobTitleText}>
            Labadi Beach Event Guarding
          </SentriText>

          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Icon name="location" size={16} color={Colors.gold} />
              <View>
                <SentriText variant="caption" color={Colors.textSecondary}>LOCATION</SentriText>
                <SentriText variant="body" color={Colors.text}>Labadi Beach Resort, Accra</SentriText>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Icon name="time" size={16} color={Colors.gold} />
              <View>
                <SentriText variant="caption" color={Colors.textSecondary}>DURATION & SHIFT</SentriText>
                <SentriText variant="body" color={Colors.text}>18:00 - 02:00 (8 Hours)</SentriText>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Icon name="user" size={16} color={Colors.gold} />
              <View>
                <SentriText variant="caption" color={Colors.textSecondary}>ASSIGNED TEAM</SentriText>
                <SentriText variant="body" color={Colors.text}>2x VIP Bodyguards + 2x Event Officers</SentriText>
              </View>
            </View>
          </View>
        </TacticalCard>

        {/* 2. Select Payment Method */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            SELECT PAYMENT METHOD
          </SentriText>
        </View>

        <View style={styles.paymentMethodList}>
          <TouchableOpacity
            style={[styles.methodCard, paymentMethod === 'paystack' && styles.methodCardActive]}
            onPress={() => setPaymentMethod('paystack')}
            activeOpacity={0.8}
          >
            <View style={styles.methodLeft}>
              <View style={styles.radioOuter}>
                {paymentMethod === 'paystack' && <View style={styles.radioInner} />}
              </View>
              <Icon name="wallet" size={20} color={Colors.gold} />
              <View>
                <SentriText variant="h3" style={styles.methodTitle}>Paystack Checkout</SentriText>
                <SentriText variant="caption" color={Colors.textMuted}>Debit/Credit Card • Apple Pay • Bank Transfer</SentriText>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodCard, paymentMethod === 'momo' && styles.methodCardActive]}
            onPress={() => setPaymentMethod('momo')}
            activeOpacity={0.8}
          >
            <View style={styles.methodLeft}>
              <View style={styles.radioOuter}>
                {paymentMethod === 'momo' && <View style={styles.radioInner} />}
              </View>
              <Icon name="card" size={20} color={Colors.gold} />
              <View>
                <SentriText variant="h3" style={styles.methodTitle}>Mobile Money (MoMo)</SentriText>
                <SentriText variant="caption" color={Colors.textMuted}>MTN MoMo • Vodafone Cash • AirtelTigo</SentriText>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* 3. Price Breakdown Card */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            PRICE & ESCROW BREAKDOWN
          </SentriText>
        </View>

        <TacticalCard backgroundColor={Colors.surface} style={styles.breakdownCard}>
          <View style={styles.costRow}>
            <SentriText variant="body" color={Colors.textSecondary}>2x Senior VIP Escorts (8 hrs @ GHS 120/hr)</SentriText>
            <SentriText variant="mono" color={Colors.text}>GHS 1,920.00</SentriText>
          </View>

          <View style={styles.costRow}>
            <SentriText variant="body" color={Colors.textSecondary}>2x Event Officers (8 hrs @ GHS 85/hr)</SentriText>
            <SentriText variant="mono" color={Colors.text}>GHS 1,360.00</SentriText>
          </View>

          <View style={styles.costRow}>
            <SentriText variant="body" color={Colors.textSecondary}>AI Threat Assessment Fee</SentriText>
            <SentriText variant="mono" color={Colors.textSuccess}>INCLUDED (FREE)</SentriText>
          </View>

          <View style={styles.costRow}>
            <SentriText variant="body" color={Colors.textSecondary}>Paystack Escrow Protection</SentriText>
            <SentriText variant="mono" color={Colors.textSuccess}>INCLUDED</SentriText>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <View>
              <SentriText variant="h2" color={Colors.text}>Total Escrow Hold</SentriText>
              <SentriText variant="caption" color={Colors.textMuted}>Charged via Paystack Escrow</SentriText>
            </View>
            <SentriText variant="h1" color={Colors.gold} style={styles.totalAmount}>
              GHS 3,280.00
            </SentriText>
          </View>
        </TacticalCard>

        {/* 4. Paystack Protection Guarantee Banner */}
        <TacticalCard backgroundColor={Colors.surface} style={styles.escrowNoticeCard}>
          <View style={styles.escrowNoticeRow}>
            <Icon name="lock" size={24} color={Colors.gold} />
            <View style={styles.noticeTextGroup}>
              <SentriText variant="h3" color={Colors.gold}>100% Paystack Escrow Guarantee</SentriText>
              <SentriText variant="caption" color={Colors.textSecondary} style={styles.noticeDesc}>
                Funds are held safely in escrow and are only released to operatives after shift completion and your explicit confirmation.
              </SentriText>
            </View>
          </View>
        </TacticalCard>

        {/* 5. Checkout Action Button */}
        <View style={styles.actionSection}>
          <SentriButton
            title="AUTHORIZE GHS 3,280.00 HOLD →"
            variant="primary"
            size="md"
            loading={loading}
            onPress={handlePaystackEscrowPay}
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
    letterSpacing: 1,
    marginBottom: 4,
  },
  mainHeading: {
    fontSize: 26,
    marginBottom: 4,
  },
  summaryCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  specBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusPill: {
    backgroundColor: 'rgba(56, 176, 0, 0.1)',
    borderWidth: 1,
    borderColor: Colors.textSuccess,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  jobTitleText: {
    fontSize: 20,
    marginBottom: Spacing.md,
  },
  detailGrid: {
    gap: 12,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionHeader: {
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1,
  },
  paymentMethodList: {
    gap: 10,
    marginBottom: Spacing.lg,
  },
  methodCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
  },
  methodCardActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.surfaceElevated,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.gold,
  },
  methodTitle: {
    fontSize: 15,
  },
  breakdownCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalAmount: {
    fontSize: 24,
  },
  escrowNoticeCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  escrowNoticeRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  noticeTextGroup: {
    flex: 1,
    gap: 4,
  },
  noticeDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  actionSection: {
    marginTop: Spacing.xs,
  },
});
