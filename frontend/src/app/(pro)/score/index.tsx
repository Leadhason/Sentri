import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriButton } from '@/components/ui/SentriButton';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { TacticalCard } from '@/components/ui/TacticalCard';
import { DiamondAperture } from '@/components/ui/DiamondAperture';
import { Icon } from '@/components/ui/Icon';
import { apiClient } from '@/lib/apiClient';

export default function TrustScoreScreen() {
  const router = useRouter();
  const [scoreData, setScoreData] = React.useState<any>({
    trustScore: 96,
    baseScore: 95,
    aiAdjustment: 1,
  });

  React.useEffect(() => {
    apiClient.get<any>('/api/professionals/me/score')
      .then((res) => {
        if (res && typeof res.trustScore === 'number') {
          setScoreData(res);
        }
      })
      .catch(() => {
        // Keep default fallback
      });
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack={false} rightIcon="notifications" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Score Hero Panel */}
        <TacticalCard
          backgroundColor={Colors.surface}
          borderColor={Colors.gold}
          accentColor={Colors.gold}
          style={styles.heroCard}
        >
          <View style={styles.apertureBox}>
            <DiamondAperture size={110} value={scoreData.trustScore || 96} showValue={true} filled={true} color={Colors.gold} />
            <SentriText variant="monoSmall" color={Colors.gold} style={styles.tierTag}>
              VERIFIED TACTICAL SPECIALIST
            </SentriText>
          </View>
        </TacticalCard>

        {/* Score Component Breakdown */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.uppercaseLabel}>
            DETERMINISTIC SCORE FORMULA BREAKDOWN
          </SentriText>
        </View>

        <TacticalCard backgroundColor={Colors.surface} style={styles.breakdownCard}>
          <View style={styles.scoreRow}>
            <View style={styles.scoreRowLeft}>
              <Icon name="time" size={16} color={Colors.textSuccess} />
              <View>
                <SentriText variant="h3" style={styles.scoreRowTitle}>
                  Punctuality & Shift Attendance
                </SentriText>
                <SentriText variant="caption" color={Colors.textSecondary}>
                  Geofenced on-time arrival rate: 98%
                </SentriText>
              </View>
            </View>
            <SentriText variant="mono" color={Colors.gold}>+40 PTS</SentriText>
          </View>

          <View style={styles.scoreRow}>
            <View style={styles.scoreRowLeft}>
              <Icon name="star" size={16} color={Colors.gold} />
              <View>
                <SentriText variant="h3" style={styles.scoreRowTitle}>
                  Client Incident & Service Ratings
                </SentriText>
                <SentriText variant="caption" color={Colors.textSecondary}>
                  Average client rating: 4.9 / 5.0 (142 Ops)
                </SentriText>
              </View>
            </View>
            <SentriText variant="mono" color={Colors.gold}>+35 PTS</SentriText>
          </View>

          <View style={styles.scoreRow}>
            <View style={styles.scoreRowLeft}>
              <Icon name="shield-checkmark" size={16} color={Colors.gold} />
              <View>
                <SentriText variant="h3" style={styles.scoreRowTitle}>
                  Document & Identity Verification
                </SentriText>
                <SentriText variant="caption" color={Colors.textSecondary}>
                  ID, Police clearance & certificates verified
                </SentriText>
              </View>
            </View>
            <SentriText variant="mono" color={Colors.gold}>+20 PTS</SentriText>
          </View>

          <View style={styles.scoreRow}>
            <View style={styles.scoreRowLeft}>
              <Icon name="shield" size={16} color={Colors.info} />
              <View>
                <SentriText variant="h3" style={styles.scoreRowTitle}>
                  Bounded AI Behavioral Nudge
                </SentriText>
                <SentriText variant="caption" color={Colors.textSecondary}>
                  Claude AI pattern analysis (Max ±15 pts threshold)
                </SentriText>
              </View>
            </View>
            <SentriText variant="mono" color={Colors.gold}>+1 PT</SentriText>
          </View>
        </TacticalCard>

        {/* Anomaly History Link */}
        <TouchableOpacity
          style={styles.anomalyCard}
          onPress={() => router.push('/(pro)/score/anomalies' as any)}
          activeOpacity={0.8}
        >
          <View style={styles.anomalyLeft}>
            <Icon name="alert-triangle" size={18} color={Colors.gold} />
            <View>
              <SentriText variant="h3" color={Colors.text}>
                Anomaly History & Appeals
              </SentriText>
              <SentriText variant="monoSmall" color={Colors.textSecondary}>
                0 ACTIVE GEOLOCATION FLAGS
              </SentriText>
            </View>
          </View>
          <Icon name="chevron-forward" size={18} color={Colors.gold} />
        </TouchableOpacity>
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
  heroCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  apertureBox: {
    alignItems: 'center',
  },
  tierTag: {
    fontSize: 11,
    letterSpacing: 2,
    marginTop: Spacing.md,
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: 6,
  },
  uppercaseLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  breakdownCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scoreRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: Spacing.sm,
  },
  scoreRowTitle: {
    fontSize: 14,
  },
  anomalyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
  },
  anomalyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
