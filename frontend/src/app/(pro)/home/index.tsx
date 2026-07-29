import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriButton } from '@/components/ui/SentriButton';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { TacticalCard } from '@/components/ui/TacticalCard';
import { DispatchTicket } from '@/components/ui/DispatchTicket';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/context/AuthContext';

export default function ProfessionalHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [isOnDuty, setIsOnDuty] = useState(true);

  const proName = user?.fullName ? user.fullName.split(' ')[0] : 'Kwame';

  const handleToggleDuty = () => {
    setIsOnDuty(!isOnDuty);
  };

  const handleAcceptJob = (jobTitle: string, reqId: string) => {
    Alert.alert('Dispatch Accepted', `You have accepted dispatch for "${jobTitle}". Opening mission briefing...`, [
      {
        text: 'Proceed to Briefing',
        onPress: () => router.push(`/(pro)/home/request/${reqId}/accept` as any),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack={false} rightIcon="notifications" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Greeting */}
        <View style={styles.headerSection}>
          <SentriText variant="monoSmall" color={Colors.gold} style={styles.stepTag}>
            OPERATIVE DISPATCH COMMAND
          </SentriText>
          <SentriText variant="h1" style={styles.mainHeading}>
            Welcome back, {proName}
          </SentriText>
          <View style={styles.sectorRow}>
            <Icon name="location" size={14} color={Colors.gold} />
            <SentriText variant="body" color={Colors.textSecondary}>
              Accra Central & East Legon Sectors
            </SentriText>
          </View>
        </View>

        {/* 1. Hero Duty Status Card */}
        <TacticalCard
          backgroundColor={Colors.surface}
          borderColor={isOnDuty ? Colors.textSuccess : Colors.border}
          accentColor={isOnDuty ? Colors.textSuccess : Colors.borderLight}
          style={styles.dutyHeroCard}
        >
          <View style={styles.dutyTopRow}>
            <View style={styles.dutyStatusGroup}>
              <View style={[styles.beaconDot, isOnDuty ? styles.beaconActive : styles.beaconInactive]} />
              <View>
                <SentriText variant="monoSmall" color={Colors.textSecondary}>COMMAND STATUS</SentriText>
                <SentriText variant="h2" color={isOnDuty ? Colors.textSuccess : Colors.textMuted}>
                  {isOnDuty ? 'ACTIVE ON DUTY' : 'OFF DUTY'}
                </SentriText>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.toggleDutyBtn, isOnDuty ? styles.toggleDutyActive : styles.toggleDutyInactive]}
              onPress={handleToggleDuty}
              activeOpacity={0.8}
            >
              <SentriText
                variant="monoSmall"
                color={isOnDuty ? Colors.background : Colors.gold}
                style={styles.toggleDutyText}
              >
                {isOnDuty ? 'GO OFF DUTY' : 'GO ON DUTY'}
              </SentriText>
            </TouchableOpacity>
          </View>

          {/* Sub Status Banner */}
          <View style={styles.dutySubBanner}>
            <View style={styles.geofenceRow}>
              <Icon name="shield-checkmark" size={16} color={isOnDuty ? Colors.gold : Colors.textMuted} />
              <SentriText variant="caption" color={Colors.textSecondary}>
                {isOnDuty ? 'GPS Geofence: Connected (Accra Central)' : 'GPS Geofence: Disconnected'}
              </SentriText>
            </View>

            <TouchableOpacity
              style={styles.reportIncidentBtn}
              onPress={() => router.push('/(pro)/home/incident' as any)}
              activeOpacity={0.8}
            >
              <Icon name="alert-circle" size={14} color={Colors.danger} />
              <SentriText variant="caption" color={Colors.danger} style={styles.reportText}>
                REPORT INCIDENT
              </SentriText>
            </TouchableOpacity>
          </View>
        </TacticalCard>

        {/* 2. Operative Performance & Earnings Dashboard (4 Grid Stat Boxes) */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            OPERATIVE METRICS & EARNINGS
          </SentriText>
        </View>

        <View style={styles.metricsGrid}>
          <TacticalCard backgroundColor={Colors.surface} style={styles.metricCard}>
            <Icon name="shield" size={18} color={Colors.gold} />
            <SentriText variant="h2" color={Colors.gold} style={styles.metricValue}>
              96
            </SentriText>
            <SentriText variant="caption" color={Colors.textSecondary}>Trust Score</SentriText>
          </TacticalCard>

          <TacticalCard backgroundColor={Colors.surface} style={styles.metricCard}>
            <Icon name="wallet" size={18} color={Colors.textSuccess} />
            <SentriText variant="h2" color={Colors.textSuccess} style={styles.metricValue}>
              2.8k
            </SentriText>
            <SentriText variant="caption" color={Colors.textSecondary}>Week (GHS)</SentriText>
          </TacticalCard>

          <TacticalCard backgroundColor={Colors.surface} style={styles.metricCard}>
            <Icon name="checkmark-circle" size={18} color={Colors.text} />
            <SentriText variant="h2" color={Colors.text} style={styles.metricValue}>
              142
            </SentriText>
            <SentriText variant="caption" color={Colors.textSecondary}>Ops Done</SentriText>
          </TacticalCard>

          <TacticalCard backgroundColor={Colors.surface} style={styles.metricCard}>
            <Icon name="star" size={18} color={Colors.gold} />
            <SentriText variant="h2" color={Colors.gold} style={styles.metricValue}>
              98%
            </SentriText>
            <SentriText variant="caption" color={Colors.textSecondary}>Accept Rate</SentriText>
          </TacticalCard>
        </View>

        {/* 3. Incoming Dispatch Requests Section */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            INCOMING DISPATCH OFFERS (2)
          </SentriText>
        </View>

        <View style={styles.dispatchList}>
          {/* Dispatch Offer 1 */}
          <TacticalCard backgroundColor={Colors.surface} style={styles.offerCard}>
            <View style={styles.offerHeader}>
              <View style={styles.offerTitleBox}>
                <Icon name="shield-checkmark" size={18} color={Colors.gold} />
                <SentriText variant="h3" style={styles.offerTitle}>
                  Labadi Beach Event Guarding
                </SentriText>
              </View>
              <View style={styles.priceBadge}>
                <SentriText variant="h3" color={Colors.gold}>GHS 720</SentriText>
              </View>
            </View>

            <View style={styles.offerMeta}>
              <View style={styles.metaRow}>
                <Icon name="location" size={14} color={Colors.textSecondary} />
                <SentriText variant="caption" color={Colors.textSecondary}>Labadi Beach Resort, Accra</SentriText>
              </View>
              <View style={styles.metaRow}>
                <Icon name="time" size={14} color={Colors.textSecondary} />
                <SentriText variant="caption" color={Colors.textSecondary}>18:00 - 00:00 (6 Hours)</SentriText>
              </View>
            </View>

            <View style={styles.offerActions}>
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() => handleAcceptJob('Labadi Beach Event Guarding', 'req_101')}
                activeOpacity={0.8}
              >
                <Icon name="checkmark-circle" size={16} color={Colors.background} />
                <SentriText variant="monoSmall" color={Colors.background} style={styles.btnText}>
                  ACCEPT DISPATCH
                </SentriText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.declineBtn}
                onPress={() => Alert.alert('Offer Declined', 'You have declined this dispatch offer.')}
                activeOpacity={0.8}
              >
                <SentriText variant="caption" color={Colors.textMuted}>DECLINE</SentriText>
              </TouchableOpacity>
            </View>
          </TacticalCard>

          {/* Dispatch Offer 2 */}
          <TacticalCard backgroundColor={Colors.surface} style={styles.offerCard}>
            <View style={styles.offerHeader}>
              <View style={styles.offerTitleBox}>
                <Icon name="shield" size={18} color={Colors.gold} />
                <SentriText variant="h3" style={styles.offerTitle}>
                  Airport Area VIP Escort
                </SentriText>
              </View>
              <View style={styles.priceBadge}>
                <SentriText variant="h3" color={Colors.gold}>GHS 600</SentriText>
              </View>
            </View>

            <View style={styles.offerMeta}>
              <View style={styles.metaRow}>
                <Icon name="location" size={14} color={Colors.textSecondary} />
                <SentriText variant="caption" color={Colors.textSecondary}>Airport Residential, Accra</SentriText>
              </View>
              <View style={styles.metaRow}>
                <Icon name="time" size={14} color={Colors.textSecondary} />
                <SentriText variant="caption" color={Colors.textSecondary}>08:00 - 12:00 (4 Hours)</SentriText>
              </View>
            </View>

            <View style={styles.offerActions}>
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() => handleAcceptJob('Airport Area VIP Escort', 'req_102')}
                activeOpacity={0.8}
              >
                <Icon name="checkmark-circle" size={16} color={Colors.background} />
                <SentriText variant="monoSmall" color={Colors.background} style={styles.btnText}>
                  ACCEPT DISPATCH
                </SentriText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.declineBtn}
                onPress={() => Alert.alert('Offer Declined', 'You have declined this dispatch offer.')}
                activeOpacity={0.8}
              >
                <SentriText variant="caption" color={Colors.textMuted}>DECLINE</SentriText>
              </TouchableOpacity>
            </View>
          </TacticalCard>
        </View>

        {/* 4. Quick Operative Toolbox */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            OPERATIVE TOOLBOX
          </SentriText>
        </View>

        <TacticalCard backgroundColor={Colors.surface} style={styles.toolboxCard}>
          <TouchableOpacity
            style={styles.toolItem}
            onPress={() => router.push('/(pro)/home/incident' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.toolLeft}>
              <View style={styles.toolIconBox}>
                <Icon name="alert-circle" size={18} color={Colors.danger} />
              </View>
              <View>
                <SentriText variant="body" color={Colors.text}>Field Incident Logger</SentriText>
                <SentriText variant="caption" color={Colors.textMuted}>File real-time operational incident report</SentriText>
              </View>
            </View>
            <Icon name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.toolItem}
            onPress={() => router.push('/(pro)/account/documents' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.toolLeft}>
              <View style={styles.toolIconBox}>
                <Icon name="shield-checkmark" size={18} color={Colors.gold} />
              </View>
              <View>
                <SentriText variant="body" color={Colors.text}>Verification Document Vault</SentriText>
                <SentriText variant="caption" color={Colors.textMuted}>Upload license & background check files</SentriText>
              </View>
            </View>
            <Icon name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.toolItem}
            onPress={() => router.push('/(pro)/score' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.toolLeft}>
              <View style={styles.toolIconBox}>
                <Icon name="star" size={18} color={Colors.gold} />
              </View>
              <View>
                <SentriText variant="body" color={Colors.text}>Trust Score Breakdown</SentriText>
                <SentriText variant="caption" color={Colors.textMuted}>Review client ratings & compliance score</SentriText>
              </View>
            </View>
            <Icon name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
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
    letterSpacing: 1,
    marginBottom: 4,
  },
  mainHeading: {
    fontSize: 26,
    marginBottom: 4,
  },
  sectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dutyHeroCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  dutyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dutyStatusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  beaconDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  beaconActive: {
    backgroundColor: Colors.textSuccess,
  },
  beaconInactive: {
    backgroundColor: Colors.textMuted,
  },
  toggleDutyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  toggleDutyActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  toggleDutyInactive: {
    backgroundColor: 'transparent',
    borderColor: Colors.gold,
  },
  toggleDutyText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dutySubBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  geofenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  reportIncidentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.dangerMuted,
    borderWidth: 1,
    borderColor: Colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  reportText: {
    fontSize: 10,
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  metricCard: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  dispatchList: {
    gap: 12,
    marginBottom: Spacing.lg,
  },
  offerCard: {
    padding: Spacing.md,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  offerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  offerTitle: {
    fontSize: 16,
  },
  priceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  offerMeta: {
    gap: 4,
    marginVertical: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  offerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.gold,
    paddingVertical: 10,
    borderRadius: 6,
  },
  btnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  declineBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  toolboxCard: {
    paddingVertical: 4,
    marginBottom: Spacing.lg,
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  toolLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  toolIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
});
