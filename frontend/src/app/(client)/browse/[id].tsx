import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriButton } from '@/components/ui/SentriButton';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { TacticalCard } from '@/components/ui/TacticalCard';
import { Icon } from '@/components/ui/Icon';
import { apiClient } from '@/lib/apiClient';

export default function ProfessionalProfileDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const proId = (params.id as string) || 'pro_1';

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>({
    fullName: 'Kwame Mensah',
    bio: '5+ years tactical experience in close VIP bodyguard detail, crowd management, and venue perimeter security across Greater Accra.',
    hourlyRate: 120,
    trustScore: 96,
    completedJobsCount: 142,
    verificationStatus: 'verified',
    specializations: ['VIP Escort', 'Crowd Control', 'Perimeter Guard', 'Accra Central'],
  });

  React.useEffect(() => {
    if (!proId.startsWith('pro_')) {
      apiClient.get<any>(`/api/professionals/${proId}`)
        .then((res) => {
          if (res) setProfile(res);
        })
        .catch(() => {
          // Keep default fallback
        });
    }
  }, [proId]);

  const handleDirectBooking = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/(client)/home/assessment/confirm' as any);
    }, 400);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack rightIcon={undefined} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Guard Profile Hero Card */}
        <TacticalCard
          backgroundColor={Colors.surface}
          borderColor={Colors.gold}
          accentColor={Colors.gold}
          style={styles.heroCard}
        >
          <View style={styles.heroHeader}>
            <View style={styles.avatarBox}>
              <Icon name="person" size={28} color={Colors.gold} />
            </View>
            <View style={styles.heroTitleBox}>
              <View style={styles.nameRow}>
                <SentriText variant="h2" style={styles.guardName}>
                  {profile.fullName || 'Kwame Mensah'}
                </SentriText>
                <Icon name="shield-checkmark" size={18} color={Colors.gold} />
              </View>
              <SentriText variant="monoSmall" color={Colors.gold}>
                OPERATIVE ID: {proId.substring(0, 8).toUpperCase()} • {(profile.verificationStatus || 'VERIFIED').toUpperCase()}
              </SentriText>
            </View>
          </View>

          <SentriText variant="body" color={Colors.textSecondary} style={styles.bioText}>
            {profile.bio || '5+ years tactical experience in close VIP bodyguard detail, crowd management, and venue perimeter security.'}
          </SentriText>

          <View style={styles.rateRow}>
            <SentriText variant="monoSmall" color={Colors.textSecondary}>HOURLY RATE</SentriText>
            <SentriText variant="h3" color={Colors.gold}>GHS {profile.hourlyRate || 120} / HR</SentriText>
          </View>
        </TacticalCard>

        {/* Trust Score Transparency Breakdown */}
        <View style={styles.section}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            TRUST SCORE & PERFORMANCE
          </SentriText>

          <View style={styles.gridStats}>
            <TacticalCard backgroundColor={Colors.surfaceElevated} style={styles.statCard}>
              <SentriText variant="monoSmall" color={Colors.textSecondary}>TRUST SCORE</SentriText>
              <SentriText variant="h2" color={Colors.gold}>{profile.trustScore || 96}/100</SentriText>
            </TacticalCard>

            <TacticalCard backgroundColor={Colors.surfaceElevated} style={styles.statCard}>
              <SentriText variant="monoSmall" color={Colors.textSecondary}>COMPLETED OPS</SentriText>
              <SentriText variant="h2" color={Colors.textSuccess}>{profile.completedJobsCount || 142}</SentriText>
            </TacticalCard>
          </View>
        </View>

        {/* Specializations & Regions */}
        <View style={styles.section}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            VERIFIED SPECIALIZATIONS
          </SentriText>

          <View style={styles.chipGrid}>
            {(Array.isArray(profile.specializations) && profile.specializations.length > 0 ? profile.specializations : ['VIP Escort', 'Crowd Control', 'Perimeter Guard']).map((chip: string) => (
              <View key={chip} style={styles.chip}>
                <Icon name="checkmark" size={12} color={Colors.gold} />
                <SentriText variant="caption" color={Colors.gold}>
                  {chip}
                </SentriText>
              </View>
            ))}
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionSection}>
          <SentriButton
            title="Direct Book Guard →"
            variant="primary"
            size="md"
            loading={loading}
            onPress={handleDirectBooking}
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
  heroCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.sm,
  },
  avatarBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(240, 167, 59, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  heroTitleBox: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  guardName: {
    fontSize: 18,
  },
  bioText: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: Spacing.md,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  gridStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(240, 167, 59, 0.12)',
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  actionSection: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
});
