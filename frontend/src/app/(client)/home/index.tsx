import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriButton } from '@/components/ui/SentriButton';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { TacticalCard } from '@/components/ui/TacticalCard';
import { DispatchTicket } from '@/components/ui/DispatchTicket';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';

export default function ClientHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const clientName = user?.fullName || 'Kwame Darko';

  // Stats State
  const [metrics, setMetrics] = useState({
    jobsPosted: 14,
    activeJobs: 2,
    guardsHired: 28,
  });

  // Popular Professionals List
  const [popularPros, setPopularPros] = useState<any[]>([
    {
      id: '22222222-2222-2222-2222-222222222221',
      fullName: 'Kwame Mensah',
      specialization: 'VIP ESCORT & CLOSE PROTECTION',
      hourlyRate: 120,
      trustScore: 96,
      completedJobsCount: 142,
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      fullName: 'Kofi Owusu',
      specialization: 'CROWD CONTROL & VENUE',
      hourlyRate: 85,
      trustScore: 92,
      completedJobsCount: 98,
    },
    {
      id: '22222222-2222-2222-2222-222222222223',
      fullName: 'Abena Appiah',
      specialization: 'STATIC GUARD & ASSET PROTECTION',
      hourlyRate: 90,
      trustScore: 94,
      completedJobsCount: 115,
    },
  ]);

  useEffect(() => {
    // Fetch professionals from backend
    apiClient.get<any>('/api/professionals')
      .then((res) => {
        let list: any[] = [];
        if (res?.content && Array.isArray(res.content)) list = res.content;
        else if (Array.isArray(res)) list = res;

        if (list.length > 0) {
          setPopularPros(list.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack={false} rightIcon="notifications" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 1. Greeting Section */}
        <View style={styles.greetingSection}>
          <SentriText variant="h1" style={styles.greetingTitle}>
            Welcome back, {clientName.split(' ')[0]}
          </SentriText>
          <SentriText variant="body" color={Colors.textSecondary}>
            Monitor active security details and initiate AI threat assessments.
          </SentriText>
        </View>

        {/* 2. Metrics Grid (3 Stat Boxes) */}
        <View style={styles.metricsGrid}>
          <TacticalCard backgroundColor={Colors.surface} style={styles.metricCard}>
            <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.metricLabel}>
              JOBS POSTED
            </SentriText>
            <SentriText variant="h1" color={Colors.gold} style={styles.metricVal}>
              {metrics.jobsPosted}
            </SentriText>
          </TacticalCard>

          <TacticalCard backgroundColor={Colors.surface} style={styles.metricCard}>
            <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.metricLabel}>
              ACTIVE JOBS
            </SentriText>
            <SentriText variant="h1" color={Colors.textSuccess} style={styles.metricVal}>
              {metrics.activeJobs}
            </SentriText>
          </TacticalCard>

          <TacticalCard backgroundColor={Colors.surface} style={styles.metricCard}>
            <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.metricLabel}>
              GUARDS HIRED
            </SentriText>
            <SentriText variant="h1" color={Colors.text} style={styles.metricVal}>
              {metrics.guardsHired}
            </SentriText>
          </TacticalCard>
        </View>

        {/* 3. Start Assessment Action Button */}
        <View style={styles.assessmentButtonSection}>
          <SentriButton
            title="START AI THREAT ASSESSMENT →"
            variant="primary"
            size="md"
            onPress={() => router.push('/(client)/home/assessment' as any)}
          />
        </View>

        {/* 4. Recent Assessment Card */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            RECENT THREAT ASSESSMENT
          </SentriText>
        </View>

        <TacticalCard
          backgroundColor={Colors.surface}
          borderColor={Colors.gold}
          accentColor={Colors.gold}
          interactive
          onPress={() => router.push('/(client)/home/assessment/results' as any)}
          style={styles.recentAssessmentCard}
        >
          <View style={styles.assessmentCardHeader}>
            <View style={styles.riskBadge}>
              <Icon name="shield-checkmark" size={16} color={Colors.gold} />
              <SentriText variant="monoSmall" color={Colors.gold}>MODERATE THREAT • LEVEL 2</SentriText>
            </View>
            <SentriText variant="monoSmall" color={Colors.textMuted}>JULY 28, 2026</SentriText>
          </View>

          <SentriText variant="h3" style={styles.assessmentTitle}>
            Labadi Beach Resort Event
          </SentriText>
          <SentriText variant="body" color={Colors.textSecondary} style={styles.assessmentDesc}>
            Perimeter crowd management and entry access control for 300+ guests. Claude AI recommended 2 VIP Bodyguards and 2 Static Officers.
          </SentriText>

          <View style={styles.assessmentCardFooter}>
            <SentriText variant="monoSmall" color={Colors.gold}>THREAT INDEX: 68/100</SentriText>
            <Icon name="chevron-forward" size={16} color={Colors.gold} />
          </View>
        </TacticalCard>

        {/* 5A. Active Dispatches Section */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            ACTIVE DISPATCHES
          </SentriText>
        </View>

        <View style={styles.activeDispatchList}>
          <DispatchTicket
            title="Labadi Beach Event Guarding"
            subtitle="4 Guards Assigned • Active Duty"
            location="Labadi, Accra"
            timeRange="18:00 - 02:00"
            statusTag="ON DUTY"
            statusColor={Colors.gold}
            priceTag="GHS 1,200"
            onPress={() => router.push('/(client)/home/active/44444444-4444-4444-4444-444444444441' as any)}
          />
        </View>

        {/* 5B. Job History Section */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            JOB HISTORY
          </SentriText>
        </View>

        <View style={styles.jobHistoryList}>
          <DispatchTicket
            title="Airport Area Private Escort"
            subtitle="2 Guards Assigned • Shift Completed"
            location="Airport Residential, Accra"
            timeRange="08:00 - 16:00"
            statusTag="CLOSED"
            statusColor={Colors.textMuted}
            priceTag="GHS 600"
            onPress={() => router.push('/shared/report/33333333-3333-3333-3333-333333333332' as any)}
          />
        </View>

        {/* 6. Popular Professionals Vertical List (Non-Slider) */}
        <View style={styles.sectionHeaderBetween}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            POPULAR VERIFIED PROFESSIONALS
          </SentriText>
          <TouchableOpacity onPress={() => router.push('/(client)/browse' as any)}>
            <SentriText variant="monoSmall" color={Colors.gold}>VIEW ALL →</SentriText>
          </TouchableOpacity>
        </View>

        <View style={styles.proVerticalList}>
          {popularPros.map((pro) => (
            <TacticalCard
              key={pro.id}
              interactive
              onPress={() => router.push(`/(client)/browse/${pro.id}` as any)}
              backgroundColor={Colors.surface}
              borderColor={Colors.border}
              accentColor={Colors.gold}
              style={styles.proVerticalCard}
            >
              <View style={styles.proCardRow}>
                <View style={styles.proAvatar}>
                  <Icon name="person" size={22} color={Colors.gold} />
                </View>

                <View style={styles.proInfoCol}>
                  <View style={styles.proNameRow}>
                    <SentriText variant="h3" style={styles.proName}>
                      {pro.fullName || pro.name}
                    </SentriText>
                    <Icon name="shield-checkmark" size={16} color={Colors.gold} />
                  </View>

                  <SentriText variant="caption" color={Colors.textSecondary} style={styles.proSpec}>
                    {Array.isArray(pro.specializations) ? pro.specializations[0] : (pro.specialization || 'VIP ESCORT')}
                  </SentriText>
                </View>

                <View style={styles.proMetaRight}>
                  <View style={styles.proScoreBadge}>
                    <Icon name="star" size={14} color={Colors.gold} />
                    <SentriText variant="mono" color={Colors.gold}>{pro.trustScore || 96}</SentriText>
                    <SentriText variant="caption" color={Colors.textMuted}>/100</SentriText>
                  </View>
                  <SentriText variant="mono" color={Colors.text} style={styles.proRateText}>
                    GHS {pro.hourlyRate || 120}/HR
                  </SentriText>
                </View>
              </View>
            </TacticalCard>
          ))}
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
    paddingBottom: 100,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  greetingSection: {
    marginVertical: Spacing.md,
  },
  stepTag: {
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 4,
  },
  greetingTitle: {
    fontSize: 26,
    marginBottom: 4,
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
  },
  metricLabel: {
    fontSize: 9,
    letterSpacing: 0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  metricVal: {
    fontSize: 28,
    fontWeight: '700',
  },
  assessmentButtonSection: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1,
  },
  recentAssessmentCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  assessmentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  assessmentTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  assessmentDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  assessmentCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  activeDispatchList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  jobHistoryList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  proVerticalList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  proVerticalCard: {
    padding: Spacing.md,
  },
  proCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proInfoCol: {
    flex: 1,
  },
  proNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  proName: {
    fontSize: 15,
  },
  proSpec: {
    fontSize: 11,
    marginTop: 2,
  },
  proMetaRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  proScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  proRateText: {
    fontSize: 12,
  },
});
