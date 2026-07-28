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
    // Ignore parse error
  }

  const aiRec = assessment?.aiRecommendation || {};
  const threatLevel = aiRec.threatLevel || 'ELEVATED';
  const indexScore = aiRec.indexScore || 78;
  const summary = aiRec.summary || 'Claude AI threat analysis indicates elevated crowd risk and VIP transport exposure. We recommend a specialized team for your deployment.';
  const assessmentId = assessment?.id || 'ass_default';

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack rightIcon={undefined} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title Header */}
        <View style={styles.headerSection}>
          <SentriText variant="h1" style={styles.mainHeading}>
            Assessment Complete
          </SentriText>
          <View style={styles.locationTag}>
            <Icon name="location" size={14} color={Colors.gold} />
            <SentriText variant="monoSmall" color={Colors.textSecondary}>
              Accra Central District // Multi-Day Deployment
            </SentriText>
          </View>
        </View>

        {/* Risk Level Hero Panel */}
        <TacticalCard
          backgroundColor={Colors.surface}
          borderColor={Colors.warning}
          accentColor={Colors.warning}
          style={styles.heroCard}
        >
          <View style={styles.heroTopRow}>
            <View>
              <SentriText variant="monoSmall" color={Colors.warning} style={styles.riskLabel}>
                THREAT LEVEL
              </SentriText>
              <SentriText variant="h1" color={Colors.warning} style={styles.riskLevelText}>
                ELEVATED
              </SentriText>
            </View>
            <View style={styles.scoreBox}>
              <SentriText variant="monoSmall" color={Colors.textSecondary}>
                INDEX SCORE
              </SentriText>
              <SentriText variant="h2" color={Colors.text} style={styles.scoreNum}>
                78<SentriText variant="caption" color={Colors.textMuted}>/100</SentriText>
              </SentriText>
            </View>
          </View>

          {/* Progress Gauge */}
          <View style={styles.gaugeTrack}>
            <View style={[styles.gaugeFill, { width: '78%' }]} />
          </View>

          <View style={styles.gaugeLabels}>
            <SentriText variant="monoSmall" color={Colors.textSuccess}>LOW</SentriText>
            <SentriText variant="monoSmall" color={Colors.warning}>ELEVATED</SentriText>
            <SentriText variant="monoSmall" color={Colors.danger}>CRITICAL</SentriText>
          </View>
        </TacticalCard>

        {/* Analysis Summary */}
        <View style={styles.section}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            AI THREAT SUMMARY
          </SentriText>
          <TacticalCard backgroundColor={Colors.surface}>
            <SentriText variant="body" color={Colors.text} style={styles.summaryText}>
              Claude AI threat analysis indicates elevated crowd risk and VIP transport exposure. We recommend a 4-guard specialized team for 4 hours.
            </SentriText>
          </TacticalCard>
        </View>

        {/* Recommended Guard Team */}
        <View style={styles.section}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            RECOMMENDED DEPLOYMENT TEAM
          </SentriText>

          <TacticalCard backgroundColor={Colors.surfaceElevated} style={styles.teamRow}>
            <View style={styles.teamLeft}>
              <Icon name="shield-checkmark" size={18} color={Colors.gold} />
              <View>
                <SentriText variant="h3" style={styles.roleName}>
                  1x Senior VIP Escort
                </SentriText>
                <SentriText variant="caption" color={Colors.textSecondary}>
                  Close Protection • GHS 120/hr
                </SentriText>
              </View>
            </View>
            <SentriText variant="mono" color={Colors.gold}>GHS 480</SentriText>
          </TacticalCard>

          <TacticalCard backgroundColor={Colors.surfaceElevated} style={styles.teamRow}>
            <View style={styles.teamLeft}>
              <Icon name="shield" size={18} color={Colors.gold} />
              <View>
                <SentriText variant="h3" style={styles.roleName}>
                  3x Event Crowd Guards
                </SentriText>
                <SentriText variant="caption" color={Colors.textSecondary}>
                  Perimeter Control • GHS 80/hr each
                </SentriText>
              </View>
            </View>
            <SentriText variant="mono" color={Colors.gold}>GHS 960</SentriText>
          </TacticalCard>
        </View>

        {/* Total Cost Bar & Action Button */}
        <View style={styles.totalBar}>
          <View>
            <SentriText variant="monoSmall" color={Colors.textSecondary}>
              TOTAL ESTIMATED ESCROW
            </SentriText>
            <SentriText variant="h2" color={Colors.gold} style={styles.totalPrice}>
              GHS 1,440
            </SentriText>
          </View>

          <SentriButton
            title="Confirm & Book →"
            variant="primary"
            size="md"
            onPress={() =>
              router.push({
                pathname: '/(client)/home/assessment/confirm' as any,
                params: { assessmentId },
              })
            }
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
  mainHeading: {
    fontSize: 24,
    marginBottom: 4,
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  riskLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  riskLevelText: {
    fontSize: 28,
    fontWeight: '700',
  },
  scoreBox: {
    alignItems: 'flex-end',
  },
  scoreNum: {
    fontSize: 22,
    fontWeight: '700',
  },
  gaugeTrack: {
    height: 8,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
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
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
    padding: Spacing.md,
  },
  teamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roleName: {
    fontSize: 15,
  },
  totalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '700',
  },
});
