import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriButton } from '@/components/ui/SentriButton';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { TacticalCard } from '@/components/ui/TacticalCard';
import { Icon } from '@/components/ui/Icon';

export default function AssessmentResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  let assessment: any = null;
  try {
    if (params.assessmentData) {
      assessment = JSON.parse(params.assessmentData as string);
    }
  } catch {
    // Fallback
  }

  const aiRec = assessment?.aiRecommendation || {};
  const threatLevel = aiRec.threatLevel || 'MODERATE THREAT';
  const indexScore = aiRec.indexScore || 68;
  const summary = aiRec.summary || 'Based on your event profile (120 expected attendees at Labadi Beach Resort), our AI analysis identified moderate crowd density exposure and entry access vulnerability. We recommend a 4-operative security team.';
  const eventType = assessment?.eventType || 'Event & Venue Security';
  const location = assessment?.location || 'Labadi';

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack rightIcon="notifications" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title Header */}
        <View style={styles.headerSection}>
          <SentriText variant="monoSmall" color={Colors.gold} style={styles.stepTag}>
            AI ANALYSIS REPORT GENERATED
          </SentriText>
          <SentriText variant="h1" style={styles.mainHeading}>
            Security Assessment
          </SentriText>
          <View style={styles.locationTag}>
            <Icon name="location" size={14} color={Colors.gold} />
            <SentriText variant="body" color={Colors.textSecondary}>
              {location} Sector • {eventType}
            </SentriText>
          </View>
        </View>

        {/* 1. Risk & Threat Level Meter Card */}
        <TacticalCard
          backgroundColor={Colors.surface}
          borderColor={Colors.warning}
          accentColor={Colors.warning}
          style={styles.heroCard}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.threatBadgeGroup}>
              <SentriText variant="monoSmall" color={Colors.warning} style={styles.riskLabel}>
                ASSESSED RISK LEVEL
              </SentriText>
              <SentriText variant="h1" color={Colors.warning} style={styles.riskLevelText}>
                {threatLevel}
              </SentriText>
            </View>

            <View style={styles.scoreCircle}>
              <SentriText variant="h1" color={Colors.gold} style={styles.scoreNum}>
                {indexScore}
              </SentriText>
              <SentriText variant="caption" color={Colors.textMuted}>/100 INDEX</SentriText>
            </View>
          </View>

          {/* Segmented Risk Gauge */}
          <View style={styles.gaugeTrack}>
            <View style={[styles.gaugeFill, { width: `${indexScore}%` }]} />
          </View>

          <View style={styles.gaugeLabels}>
            <SentriText variant="caption" color={Colors.textSuccess}>LOW (0-35)</SentriText>
            <SentriText variant="caption" color={Colors.warning}>MODERATE (36-70)</SentriText>
            <SentriText variant="caption" color={Colors.danger}>CRITICAL (71-100)</SentriText>
          </View>
        </TacticalCard>

        {/* 2. AI Threat Analysis & Key Risks Identified */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            CLAUDE AI THREAT ANALYSIS
          </SentriText>
        </View>

        <TacticalCard backgroundColor={Colors.surface} style={styles.cardPadding}>
          <SentriText variant="body" color={Colors.text} style={styles.summaryText}>
            {summary}
          </SentriText>

          <View style={styles.riskFactorsGroup}>
            <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.riskFactorTitle}>
              KEY RISK FACTORS IDENTIFIED
            </SentriText>

            <View style={styles.factorItem}>
              <Icon name="alert-circle" size={16} color={Colors.warning} />
              <SentriText variant="body" color={Colors.text} style={styles.factorText}>
                <SentriText variant="body" color={Colors.warning}>Perimeter Access:</SentriText> Unmonitored beach access points require physical security posts.
              </SentriText>
            </View>

            <View style={styles.factorItem}>
              <Icon name="alert-circle" size={16} color={Colors.warning} />
              <SentriText variant="body" color={Colors.text} style={styles.factorText}>
                <SentriText variant="body" color={Colors.warning}>Crowd Bottleneck:</SentriText> Entry point guest registration requires 2x dedicated event officers.
              </SentriText>
            </View>

            <View style={styles.factorItem}>
              <Icon name="shield-checkmark" size={16} color={Colors.gold} />
              <SentriText variant="body" color={Colors.text} style={styles.factorText}>
                <SentriText variant="body" color={Colors.gold}>VIP Escort:</SentriText> High-profile attendees require close escort detail.
              </SentriText>
            </View>
          </View>
        </TacticalCard>

        {/* 3. Recommended Operative Team Table */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            RECOMMENDED DEPLOYMENT TEAM
          </SentriText>
        </View>

        <View style={styles.teamList}>
          <TacticalCard backgroundColor={Colors.surface} style={styles.teamCard}>
            <View style={styles.teamLeft}>
              <View style={styles.iconCircle}>
                <Icon name="shield-checkmark" size={20} color={Colors.gold} />
              </View>
              <View style={styles.teamInfo}>
                <SentriText variant="h3" style={styles.roleTitle}>
                  2x Senior VIP Bodyguards
                </SentriText>
                <SentriText variant="caption" color={Colors.textSecondary}>
                  Close Protection • GHS 120/hr • 8 Hours
                </SentriText>
              </View>
            </View>
            <SentriText variant="h3" color={Colors.gold}>
              GHS 1,920
            </SentriText>
          </TacticalCard>

          <TacticalCard backgroundColor={Colors.surface} style={styles.teamCard}>
            <View style={styles.teamLeft}>
              <View style={styles.iconCircle}>
                <Icon name="shield" size={20} color={Colors.gold} />
              </View>
              <View style={styles.teamInfo}>
                <SentriText variant="h3" style={styles.roleTitle}>
                  2x Event Security Officers
                </SentriText>
                <SentriText variant="caption" color={Colors.textSecondary}>
                  Entry Control & Perimeter • GHS 85/hr • 8 Hours
                </SentriText>
              </View>
            </View>
            <SentriText variant="h3" color={Colors.gold}>
              GHS 1,360
            </SentriText>
          </TacticalCard>
        </View>

        {/* 4. Total Cost & Action Button */}
        <TacticalCard backgroundColor={Colors.surface} style={styles.totalBarCard}>
          <View style={styles.totalRow}>
            <View>
              <SentriText variant="caption" color={Colors.textSecondary}>TOTAL ESTIMATED ESCROW</SentriText>
              <SentriText variant="h1" color={Colors.gold}>
                GHS 3,280.00
              </SentriText>
            </View>

            <SentriButton
              title="PROCEED TO CHECKOUT →"
              variant="primary"
              size="md"
              onPress={() =>
                router.push({
                  pathname: '/(client)/home/assessment/confirm' as any,
                  params: { assessmentId: assessment?.id || 'ass_default' },
                })
              }
            />
          </View>
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
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  threatBadgeGroup: {
    gap: 2,
  },
  riskLabel: {
    fontSize: 11,
    letterSpacing: 1,
  },
  riskLevelText: {
    fontSize: 22,
    fontWeight: '700',
  },
  scoreCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNum: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  gaugeTrack: {
    height: 8,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gaugeFill: {
    height: '100%',
    backgroundColor: Colors.warning,
    borderRadius: 4,
  },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1,
  },
  cardPadding: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  riskFactorsGroup: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  riskFactorTitle: {
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 2,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  factorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  teamList: {
    gap: 10,
    marginBottom: Spacing.lg,
  },
  teamCard: {
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamInfo: {
    gap: 2,
  },
  roleTitle: {
    fontSize: 15,
  },
  totalBarCard: {
    padding: Spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
