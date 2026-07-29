import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { TacticalCard } from '@/components/ui/TacticalCard';
import { DispatchTicket } from '@/components/ui/DispatchTicket';
import { Icon } from '@/components/ui/Icon';

export default function ProfessionalJobsHubScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [checkedIn, setCheckedIn] = useState(false);

  const handleCheckin = () => {
    setCheckedIn(true);
    Alert.alert('Check-in Verified', 'Your GPS geofence location and operative check-in timestamp have been recorded.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack={false} rightIcon="notifications" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Title */}
        <View style={styles.headerSection}>
          <SentriText variant="monoSmall" color={Colors.gold} style={styles.stepTag}>
            SHIFT OPERATIONS & HISTORY
          </SentriText>
          <SentriText variant="h1" style={styles.mainHeading}>
            My Jobs
          </SentriText>
        </View>

        {/* Top Segmented Control Tabs */}
        <View style={styles.segmentedContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'active' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('active')}
            activeOpacity={0.8}
          >
            <Icon
              name="shield-checkmark"
              size={14}
              color={activeTab === 'active' ? Colors.gold : Colors.textMuted}
            />
            <SentriText
              variant="monoSmall"
              color={activeTab === 'active' ? Colors.gold : Colors.textMuted}
              style={styles.segmentText}
            >
              ACTIVE DEPLOYMENT (1)
            </SentriText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'history' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('history')}
            activeOpacity={0.8}
          >
            <Icon
              name="checkmark-circle"
              size={14}
              color={activeTab === 'history' ? Colors.gold : Colors.textMuted}
            />
            <SentriText
              variant="monoSmall"
              color={activeTab === 'history' ? Colors.gold : Colors.textMuted}
              style={styles.segmentText}
            >
              COMPLETED (3)
            </SentriText>
          </TouchableOpacity>
        </View>

        {/* TAB 1: ACTIVE SHIFT CONTROL CENTER */}
        {activeTab === 'active' && (
          <View style={styles.activeTabContent}>
            {/* Live Mission Card */}
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
                    ACTIVE SHIFT // GEOFENCE VERIFIED
                  </SentriText>
                </View>

                <SentriText variant="h1" color={Colors.text} style={styles.shiftTimer}>
                  03 : 42 : 15
                </SentriText>

                <SentriText variant="h2" style={styles.jobTitleText}>
                  Labadi Beach Event Guarding
                </SentriText>

                <View style={styles.locationPill}>
                  <Icon name="location" size={14} color={Colors.gold} />
                  <SentriText variant="caption" color={Colors.textSecondary}>
                    Labadi Beach Resort, Accra
                  </SentriText>
                </View>
              </View>

              <View style={styles.heroMetaRow}>
                <View style={styles.metaItem}>
                  <SentriText variant="caption" color={Colors.textSecondary}>SHIFT PAY</SentriText>
                  <SentriText variant="h3" color={Colors.gold}>GHS 720.00</SentriText>
                </View>

                <View style={styles.metaDivider} />

                <View style={styles.metaItem}>
                  <SentriText variant="caption" color={Colors.textSecondary}>SCHEDULE</SentriText>
                  <SentriText variant="body" color={Colors.text}>18:00 - 00:00</SentriText>
                </View>

                <View style={styles.metaDivider} />

                <View style={styles.metaItem}>
                  <SentriText variant="caption" color={Colors.textSecondary}>GEOFENCE</SentriText>
                  <SentriText variant="caption" color={Colors.textSuccess} style={styles.boldText}>
                    INSIDE SECTOR ✓
                  </SentriText>
                </View>
              </View>
            </TacticalCard>

            {/* HIGH-VISIBILITY INSTANT ACTION TILES (2x2 Grid) */}
            <View style={styles.sectionHeader}>
              <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
                CRITICAL SHIFT ACTIONS
              </SentriText>
            </View>

            <View style={styles.actionGrid}>
              {/* Tile 1: Guard Check-in (GOLD) */}
              <TouchableOpacity
                style={[styles.tileCard, checkedIn ? styles.greenTile : styles.goldTile]}
                onPress={handleCheckin}
                activeOpacity={0.8}
              >
                <View style={checkedIn ? styles.tileIconCircleGreen : styles.tileIconCircleGold}>
                  <Icon name="shield-checkmark" size={22} color={checkedIn ? Colors.textSuccess : Colors.gold} />
                </View>
                <SentriText variant="h3" color={checkedIn ? Colors.textSuccess : Colors.gold} style={styles.tileTitle}>
                  {checkedIn ? 'Verified ✓' : 'Check-in Now'}
                </SentriText>
                <SentriText variant="caption" color={Colors.textMuted} style={styles.tileSub}>
                  GPS Verification
                </SentriText>
              </TouchableOpacity>

              {/* Tile 2: Report Field Incident (RED) */}
              <TouchableOpacity
                style={[styles.tileCard, styles.emergencyTile]}
                onPress={() => router.push('/(pro)/home/incident' as any)}
                activeOpacity={0.8}
              >
                <View style={styles.tileIconCircleRed}>
                  <Icon name="alert-circle" size={22} color={Colors.danger} />
                </View>
                <SentriText variant="h3" color={Colors.danger} style={styles.tileTitle}>
                  Log Incident
                </SentriText>
                <SentriText variant="caption" color={Colors.textMuted} style={styles.tileSub}>
                  Field Alert
                </SentriText>
              </TouchableOpacity>

              {/* Tile 3: Call Client Host (SURFACE) */}
              <TouchableOpacity
                style={[styles.tileCard, styles.surfaceTile]}
                onPress={() => router.push('/shared/call' as any)}
                activeOpacity={0.8}
              >
                <View style={styles.tileIconCircleBlue}>
                  <Icon name="call" size={22} color={Colors.text} />
                </View>
                <SentriText variant="h3" color={Colors.text} style={styles.tileTitle}>
                  Call Client
                </SentriText>
                <SentriText variant="caption" color={Colors.textMuted} style={styles.tileSub}>
                  Host Contact
                </SentriText>
              </TouchableOpacity>

              {/* Tile 4: View AI Report (SURFACE) */}
              <TouchableOpacity
                style={[styles.tileCard, styles.surfaceTile]}
                onPress={() => router.push('/shared/report/33333333-3333-3333-3333-333333333332' as any)}
                activeOpacity={0.8}
              >
                <View style={styles.tileIconCircleBlue}>
                  <Icon name="shield" size={22} color={Colors.text} />
                </View>
                <SentriText variant="h3" color={Colors.text} style={styles.tileTitle}>
                  View AI Report
                </SentriText>
                <SentriText variant="caption" color={Colors.textMuted} style={styles.tileSub}>
                  Shift Summary
                </SentriText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 2: PAST SHIFTS HISTORY */}
        {activeTab === 'history' && (
          <View style={styles.historyTabContent}>
            <DispatchTicket
              title="Spintex Commercial Hub Guarding"
              subtitle="12 Hours • Escrow Released"
              location="Spintex Road, Accra"
              timeRange="08:00 - 20:00"
              statusTag="COMPLETED"
              statusColor={Colors.textMuted}
              priceTag="GHS 950"
              onPress={() => router.push('/shared/report/job_comp_1' as any)}
            />

            <DispatchTicket
              title="Ridge Executive Residence Protection"
              subtitle="12 Hours • Escrow Released"
              location="Ridge Enclave, Accra"
              timeRange="18:00 - 06:00"
              statusTag="COMPLETED"
              statusColor={Colors.textMuted}
              priceTag="GHS 1,400"
              onPress={() => router.push('/shared/report/job_comp_2' as any)}
            />

            <DispatchTicket
              title="Roman Ridge Escort Detail"
              subtitle="8 Hours • Escrow Released"
              location="Roman Ridge, Accra"
              timeRange="10:00 - 18:00"
              statusTag="COMPLETED"
              statusColor={Colors.textMuted}
              priceTag="GHS 750"
              onPress={() => router.push('/shared/report/job_comp_3' as any)}
            />
          </View>
        )}
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
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 4,
    marginBottom: Spacing.lg,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 6,
  },
  segmentBtnActive: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  segmentText: {
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.3,
  },
  activeTabContent: {
    gap: Spacing.sm,
  },
  heroCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  heroCenter: {
    alignItems: 'center',
    marginBottom: Spacing.md,
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
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '700',
    letterSpacing: 2,
    marginVertical: Spacing.xs,
    color: Colors.gold,
  },
  jobTitleText: {
    fontSize: 18,
    marginBottom: 4,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  metaItem: {
    alignItems: 'center',
    gap: 2,
  },
  metaDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  boldText: {
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: Spacing.lg,
  },
  tileCard: {
    width: '48%',
    padding: Spacing.md,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emergencyTile: {
    backgroundColor: 'rgba(230, 57, 70, 0.08)',
    borderColor: Colors.danger,
  },
  goldTile: {
    backgroundColor: 'rgba(240, 167, 59, 0.08)',
    borderColor: Colors.gold,
  },
  surfaceTile: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  greenTile: {
    backgroundColor: 'rgba(56, 176, 0, 0.08)',
    borderColor: Colors.textSuccess,
  },
  tileIconCircleRed: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(230, 57, 70, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileIconCircleGold: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(240, 167, 59, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileIconCircleBlue: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileIconCircleGreen: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(56, 176, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileTitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  tileSub: {
    fontSize: 10,
    textAlign: 'center',
  },
  historyTabContent: {
    gap: Spacing.sm,
  },
});
