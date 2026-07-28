import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { TacticalCard } from '@/components/ui/TacticalCard';
import { DispatchTicket } from '@/components/ui/DispatchTicket';
import { Icon } from '@/components/ui/Icon';

export default function ProfessionalHomeScreen() {
  const router = useRouter();
  const [isOnDuty, setIsOnDuty] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack={false} rightIcon="notifications" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Duty Status Toggle Card */}
        <TacticalCard
          backgroundColor={Colors.surface}
          borderColor={isOnDuty ? Colors.success : Colors.border}
          accentColor={isOnDuty ? Colors.success : Colors.borderLight}
          style={styles.dutyCard}
        >
          <View style={styles.dutyRow}>
            <View style={styles.dutyLeft}>
              <View style={[styles.statusDot, isOnDuty ? styles.statusDotActive : styles.statusDotInactive]} />
              <View>
                <SentriText variant="monoSmall" color={Colors.textSecondary}>DUTY STATUS</SentriText>
                <SentriText variant="h3" color={isOnDuty ? Colors.textSuccess : Colors.textMuted}>
                  {isOnDuty ? 'ACTIVE ON DUTY' : 'OFF DUTY'}
                </SentriText>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.toggleBtn, isOnDuty ? styles.toggleBtnActive : styles.toggleBtnInactive]}
              onPress={() => setIsOnDuty(!isOnDuty)}
              activeOpacity={0.8}
            >
              <SentriText
                variant="monoSmall"
                color={isOnDuty ? Colors.background : Colors.gold}
                style={styles.toggleText}
              >
                {isOnDuty ? 'GO OFF DUTY' : 'GO ON DUTY'}
              </SentriText>
            </TouchableOpacity>
          </View>
        </TacticalCard>

        {/* Trust Score Hero Card */}
        <TacticalCard
          backgroundColor={Colors.surface}
          borderColor={Colors.gold}
          accentColor={Colors.gold}
          style={styles.scoreHeroCard}
        >
          <View style={styles.scoreRow}>
            <View>
              <SentriText variant="monoSmall" color={Colors.textSecondary}>TRUST SCORE</SentriText>
              <View style={styles.scoreValRow}>
                <SentriText variant="h1" color={Colors.gold} style={styles.scoreVal}>
                  96
                </SentriText>
                <SentriText variant="caption" color={Colors.textMuted}>/100</SentriText>
              </View>
            </View>

            <View style={styles.badgeBox}>
              <Icon name="shield-checkmark" size={20} color={Colors.gold} />
              <SentriText variant="monoSmall" color={Colors.gold}>VERIFIED GUARD</SentriText>
            </View>
          </View>
        </TacticalCard>

        {/* Incoming Dispatch Requests Section */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.uppercaseLabel}>
            INCOMING DISPATCH REQUESTS (2)
          </SentriText>
        </View>

        <DispatchTicket
          title="Labadi Beach Event Guarding"
          subtitle="6 Hours • Perimeter Security"
          location="Labadi, Accra"
          timeRange="18:00 - 00:00"
          statusTag="DISPATCH OFFER"
          statusColor={Colors.gold}
          priceTag="GHS 720"
          onPress={() => router.push('/(pro)/home/request/req_101' as any)}
        />

        <DispatchTicket
          title="Airport Area VIP Escort"
          subtitle="4 Hours • Close Protection Detail"
          location="Airport Residential, Accra"
          timeRange="08:00 - 12:00"
          statusTag="DISPATCH OFFER"
          statusColor={Colors.gold}
          priceTag="GHS 600"
          onPress={() => router.push('/(pro)/home/request/req_102' as any)}
        />
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
  dutyCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  dutyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dutyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusDotActive: {
    backgroundColor: Colors.textSuccess,
  },
  statusDotInactive: {
    backgroundColor: Colors.textMuted,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  toggleBtnActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  toggleBtnInactive: {
    backgroundColor: 'transparent',
    borderColor: Colors.gold,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scoreHeroCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreValRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  scoreVal: {
    fontSize: 36,
    fontWeight: '700',
  },
  badgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(240, 167, 59, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  sectionHeader: {
    marginTop: Spacing.xs,
    marginBottom: 8,
  },
  uppercaseLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
});
