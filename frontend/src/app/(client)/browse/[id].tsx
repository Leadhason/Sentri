import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
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
  const proId = (params.id as string) || '22222222-2222-2222-2222-222222222221';

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>({
    id: proId,
    fullName: 'Kwame Mensah',
    specializations: ['VIP Escort & Close Protection', 'Event Perimeter Security', 'Motorcade Escort'],
    operatingLocations: ['Accra Central', 'East Legon', 'Airport Residential', 'Cantonments'],
    hourlyRate: 120,
    trustScore: 96,
    rating: 4.9,
    completedJobsCount: 142,
    onTimeRate: '99%',
    verificationStatus: 'verified',
    bio: '5+ years tactical security experience specializing in close VIP bodyguard detail, crowd management, and high-security venue access monitoring across Greater Accra.',
    expertise: ['Close Protection', 'Event Security', 'De-escalation', 'Access Control', 'First Aid / CPR'],
    certifications: [
      { name: 'Security License L2', issuer: 'Ministry of Interior', status: 'Verified' },
      { name: 'National ID & Background Check', issuer: 'Ghana Police CID', status: 'Cleared' },
      { name: 'Tactical First Aid & CPR', issuer: 'Red Cross Ghana', status: 'Active' },
    ],
    reviews: [
      {
        id: 'rev_1',
        clientName: 'Kofi Darko',
        rating: 5.0,
        date: 'July 24, 2026',
        comment: 'Kwame was extremely punctual, professional, and managed perimeter access for our 300-guest event flawlessly.',
      },
      {
        id: 'rev_2',
        clientName: 'Abena Osei',
        rating: 5.0,
        date: 'July 18, 2026',
        comment: 'Outstanding close protection detail. Provided complete security and peace of mind during our executive arrival.',
      },
    ],
  });

  useEffect(() => {
    if (proId && !proId.startsWith('pro_')) {
      apiClient.get<any>(`/api/professionals/${proId}`)
        .then((res) => {
          if (res) {
            setProfile((prev: any) => ({
              ...prev,
              ...res,
              fullName: res.fullName || prev.fullName,
              bio: res.bio || prev.bio,
              hourlyRate: res.hourlyRate || prev.hourlyRate,
              trustScore: res.trustScore || prev.trustScore,
              completedJobsCount: res.completedJobsCount || prev.completedJobsCount,
              specializations: res.specializations || prev.specializations,
              operatingLocations: res.operatingLocations || prev.operatingLocations,
            }));
          }
        })
        .catch(() => {});
    }
  }, [proId]);

  const handleHireProfessional = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/(client)/home/assessment/confirm' as any);
    }, 300);
  };

  const displayName = profile.fullName || 'Kwame Mensah';
  const displayTitle = Array.isArray(profile.specializations) && profile.specializations.length > 0
    ? profile.specializations[0]
    : 'VIP Escort & Security Specialist';
  const displayRate = profile.hourlyRate || 120;
  const displayTrustScore = profile.trustScore || 96;
  const displayRating = profile.rating || 4.9;
  const displayCompleted = profile.completedJobsCount || 142;
  const displayOnTime = profile.onTimeRate || '99%';

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack rightIcon="notifications" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 1. Operative Hero Profile Card */}
        <TacticalCard
          backgroundColor={Colors.surface}
          borderColor={Colors.gold}
          accentColor={Colors.gold}
          style={styles.heroCard}
        >
          <View style={styles.heroHeader}>
            <View style={styles.avatarCircle}>
              <SentriText variant="h1" color={Colors.gold} style={styles.avatarInitial}>
                {displayName.charAt(0).toUpperCase()}
              </SentriText>
            </View>

            <View style={styles.heroInfo}>
              <View style={styles.nameRow}>
                <SentriText variant="h2" style={styles.displayName}>
                  {displayName}
                </SentriText>
                <View style={styles.verifiedBadge}>
                  <Icon name="shield-checkmark" size={13} color={Colors.badgeText} />
                  <SentriText variant="caption" color={Colors.badgeText} style={styles.verifiedText}>
                    VERIFIED
                  </SentriText>
                </View>
              </View>

              <SentriText variant="monoSmall" color={Colors.gold} style={styles.displayTitle}>
                {displayTitle}
              </SentriText>

              <View style={styles.availabilityRow}>
                <View style={styles.liveDot} />
                <SentriText variant="caption" color={Colors.textSuccess} style={styles.availabilityText}>
                  AVAILABLE FOR DISPATCH
                </SentriText>
              </View>
            </View>
          </View>

          {/* Quick Rate Banner */}
          <View style={styles.heroRateBanner}>
            <View style={styles.rateCol}>
              <SentriText variant="caption" color={Colors.textSecondary}>HOURLY RATE</SentriText>
              <SentriText variant="h2" color={Colors.gold}>
                GHS {displayRate} / HR
              </SentriText>
            </View>
            <View style={styles.idCol}>
              <SentriText variant="caption" color={Colors.textSecondary}>ID REFERENCE</SentriText>
              <SentriText variant="monoSmall" color={Colors.textMuted}>
                #PRO-{proId.substring(0, 8).toUpperCase()}
              </SentriText>
            </View>
          </View>
        </TacticalCard>

        {/* 2. Key Performance Metrics Grid */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            PERFORMANCE & SAFETY SCORE
          </SentriText>
        </View>

        <View style={styles.metricsGrid}>
          <TacticalCard backgroundColor={Colors.surface} style={styles.metricItem}>
            <Icon name="shield" size={18} color={Colors.gold} />
            <SentriText variant="h2" color={Colors.gold} style={styles.metricVal}>
              {displayTrustScore}
            </SentriText>
            <SentriText variant="caption" color={Colors.textSecondary}>Trust Score</SentriText>
          </TacticalCard>

          <TacticalCard backgroundColor={Colors.surface} style={styles.metricItem}>
            <Icon name="star" size={18} color={Colors.gold} />
            <SentriText variant="h2" color={Colors.text} style={styles.metricVal}>
              {displayRating}
            </SentriText>
            <SentriText variant="caption" color={Colors.textSecondary}>Rating ★</SentriText>
          </TacticalCard>

          <TacticalCard backgroundColor={Colors.surface} style={styles.metricItem}>
            <Icon name="checkmark-circle" size={18} color={Colors.textSuccess} />
            <SentriText variant="h2" color={Colors.textSuccess} style={styles.metricVal}>
              {displayCompleted}
            </SentriText>
            <SentriText variant="caption" color={Colors.textSecondary}>Jobs Done</SentriText>
          </TacticalCard>

          <TacticalCard backgroundColor={Colors.surface} style={styles.metricItem}>
            <Icon name="time" size={18} color={Colors.gold} />
            <SentriText variant="h2" color={Colors.gold} style={styles.metricVal}>
              {displayOnTime}
            </SentriText>
            <SentriText variant="caption" color={Colors.textSecondary}>On-Time</SentriText>
          </TacticalCard>
        </View>

        {/* 3. Professional Bio & Summary */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            ABOUT PROFESSIONAL
          </SentriText>
        </View>

        <TacticalCard backgroundColor={Colors.surface} style={styles.cardPadding}>
          <SentriText variant="body" color={Colors.text} style={styles.bioText}>
            {profile.bio}
          </SentriText>
        </TacticalCard>

        {/* 4. Specializations & Key Skills */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            SPECIALIZATIONS & EXPERTISE
          </SentriText>
        </View>

        <TacticalCard backgroundColor={Colors.surface} style={styles.cardPadding}>
          <View style={styles.chipWrap}>
            {(profile.expertise || ['Close Protection', 'Event Security', 'De-escalation']).map((skill: string) => (
              <View key={skill} style={styles.skillChip}>
                <Icon name="checkmark" size={14} color={Colors.gold} />
                <SentriText variant="caption" color={Colors.gold} style={styles.skillText}>
                  {skill}
                </SentriText>
              </View>
            ))}
          </View>
        </TacticalCard>

        {/* 5. Operating Locations */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            COVERAGE & OPERATING LOCATIONS
          </SentriText>
        </View>

        <TacticalCard backgroundColor={Colors.surface} style={styles.cardPadding}>
          <View style={styles.locationRow}>
            <Icon name="location" size={18} color={Colors.gold} />
            <SentriText variant="body" color={Colors.text} style={styles.locationText}>
              {(profile.operatingLocations || ['Accra Central', 'East Legon']).join(' • ')}
            </SentriText>
          </View>
        </TacticalCard>

        {/* 6. Verification & Certifications */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            VERIFICATION & CERTIFICATIONS
          </SentriText>
        </View>

        <TacticalCard backgroundColor={Colors.surface} style={styles.cardPadding}>
          <View style={styles.certList}>
            {(profile.certifications || []).map((cert: any, index: number) => (
              <View key={index} style={styles.certItem}>
                <View style={styles.certLeft}>
                  <Icon name="shield-checkmark" size={18} color={Colors.textSuccess} />
                  <View>
                    <SentriText variant="body" color={Colors.text} style={styles.certName}>
                      {cert.name}
                    </SentriText>
                    <SentriText variant="caption" color={Colors.textMuted}>
                      {cert.issuer}
                    </SentriText>
                  </View>
                </View>
                <View style={styles.statusPill}>
                  <SentriText variant="caption" color={Colors.textSuccess}>
                    {cert.status.toUpperCase()}
                  </SentriText>
                </View>
              </View>
            ))}
          </View>
        </TacticalCard>

        {/* 7. Client Reviews */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            CLIENT REVIEWS & FEEDBACK
          </SentriText>
        </View>

        <View style={styles.reviewList}>
          {(profile.reviews || []).map((rev: any) => (
            <TacticalCard key={rev.id} backgroundColor={Colors.surface} style={styles.cardPadding}>
              <View style={styles.revHeader}>
                <View style={styles.revClientRow}>
                  <Icon name="user" size={16} color={Colors.gold} />
                  <SentriText variant="h3" style={styles.revClientName}>
                    {rev.clientName}
                  </SentriText>
                </View>
                <View style={styles.revStarRow}>
                  <Icon name="star" size={14} color={Colors.gold} />
                  <SentriText variant="mono" color={Colors.gold}>{rev.rating}</SentriText>
                </View>
              </View>
              <SentriText variant="body" color={Colors.textSecondary} style={styles.revComment}>
                "{rev.comment}"
              </SentriText>
              <SentriText variant="caption" color={Colors.textMuted}>
                {rev.date}
              </SentriText>
            </TacticalCard>
          ))}
        </View>

        {/* Action Button */}
        <View style={styles.actionSection}>
          <SentriButton
            title={`HIRE ${displayName.split(' ')[0].toUpperCase()} →`}
            variant="primary"
            size="md"
            loading={loading}
            onPress={handleHireProfessional}
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
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: Spacing.md,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.badgeBg,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 26,
    fontWeight: '700',
  },
  heroInfo: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  displayName: {
    fontSize: 20,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.badgeBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: Colors.badgeBorder,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.badgeText,
  },
  displayTitle: {
    fontSize: 11,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textSuccess,
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  heroRateBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rateCol: {
    gap: 2,
  },
  idCol: {
    alignItems: 'flex-end',
    gap: 2,
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
  metricItem: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '700',
  },
  cardPadding: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  skillText: {
    fontSize: 11,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    flex: 1,
  },
  certList: {
    gap: 12,
  },
  certItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  certLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  certName: {
    fontSize: 14,
  },
  statusPill: {
    backgroundColor: Colors.badgeBg,
    borderWidth: 1,
    borderColor: Colors.textSuccess,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reviewList: {
    gap: 12,
    marginBottom: Spacing.lg,
  },
  revHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  revClientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  revClientName: {
    fontSize: 14,
  },
  revStarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  revComment: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 6,
  },
  actionSection: {
    marginTop: Spacing.xs,
  },
});
