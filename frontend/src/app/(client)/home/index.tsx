import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { TacticalCard } from '@/components/ui/TacticalCard';
import { DispatchTicket } from '@/components/ui/DispatchTicket';
import { Icon } from '@/components/ui/Icon';

export default function ClientHomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack={false} rightIcon="notifications" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Active Deployments Hero Card */}
        <TacticalCard
          backgroundColor={Colors.surface}
          borderColor={Colors.border}
          accentColor={Colors.gold}
          style={styles.heroCard}
        >
          <View style={styles.heroHeader}>
            <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.uppercaseLabel}>
              ACTIVE JOBS
            </SentriText>
            <Icon name="shield-checkmark" size={24} color={Colors.gold} />
          </View>
          <View style={styles.heroBody}>
            <SentriText variant="h1" color={Colors.text} style={styles.activeCount}>
              2
            </SentriText>
            <SentriText variant="caption" color={Colors.textSecondary}>
              Secured & Geofenced
            </SentriText>
          </View>
        </TacticalCard>

        {/* Start AI Assessment Primary Action Card */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(client)/home/assessment' as any)}
          activeOpacity={0.85}
        >
          <View style={styles.actionCardLeft}>
            <View style={styles.plusIconBox}>
              <Icon name="shield" size={20} color={Colors.gold} />
            </View>
            <View>
              <SentriText variant="h3" color={Colors.text} style={styles.actionTitle}>
                Start New Assessment
              </SentriText>
              <SentriText variant="monoSmall" color={Colors.gold}>
                3 CREDITS REMAINING
              </SentriText>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color={Colors.gold} />
        </TouchableOpacity>

        {/* Recent Activity Section */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.uppercaseLabel}>
            RECENT ACTIVITY
          </SentriText>
        </View>

        {/* Active Job Ticket 1 */}
        <DispatchTicket
          title="Labadi Beach Event Guarding"
          subtitle="4 Guards Assigned • Active Duty"
          location="Labadi, Accra"
          timeRange="18:00 - 02:00"
          statusTag="ON DUTY"
          statusColor={Colors.gold}
          priceTag="GHS 1,200"
          onPress={() => router.push('/(client)/activity' as any)}
        />

        {/* Past Job Ticket 2 */}
        <DispatchTicket
          title="Airport Area Private Escort"
          subtitle="2 Guards Assigned • Shift Completed"
          location="Airport Residential, Accra"
          timeRange="08:00 - 16:00"
          statusTag="CLOSED"
          statusColor={Colors.textMuted}
          priceTag="GHS 600"
          onPress={() => router.push('/(client)/activity' as any)}
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
    paddingBottom: 100, // accommodate bottom SentriDock
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  heroCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  uppercaseLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  heroBody: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  activeCount: {
    fontSize: 48,
    lineHeight: 52,
    fontWeight: '700',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  plusIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(240, 167, 59, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: 8,
  },
});
