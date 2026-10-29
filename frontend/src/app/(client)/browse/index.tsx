import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { TacticalCard } from '@/components/ui/TacticalCard';
import { Icon } from '@/components/ui/Icon';
import { apiClient } from '@/lib/apiClient';

const FILTERS = ['ALL', 'VIP ESCORT', 'CROWD CONTROL', 'STATIC GUARD'];

const MOCK_GUARDS = [
  {
    id: '22222222-2222-2222-2222-222222222221',
    fullName: 'Kwame Mensah',
    specializations: ['VIP ESCORT & CLOSE PROTECTION', 'EVENT PERIMETER SECURITY'],
    operatingLocations: ['Accra Central', 'East Legon', 'Airport Residential'],
    hourlyRate: 120,
    trustScore: 96,
    rating: 4.9,
    completedJobsCount: 142,
    verificationStatus: 'verified',
    bio: '5+ years tactical experience in close VIP bodyguard detail, crowd management, and venue perimeter security across Greater Accra.',
    expertise: ['Close Protection', 'Armed Guard', 'Perimeter Control'],
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    fullName: 'Kofi Owusu',
    specializations: ['CROWD CONTROL & VENUE', 'STATIC GUARD DUTY'],
    operatingLocations: ['Labadi', 'Osu', 'Kumasi Central'],
    hourlyRate: 85,
    trustScore: 92,
    rating: 4.8,
    completedJobsCount: 98,
    verificationStatus: 'verified',
    bio: 'Crowd control and tactical venue security specialist with high-volume concert and event protection experience.',
    expertise: ['Crowd Control', 'Event Security', 'De-escalation'],
  },
  {
    id: '22222222-2222-2222-2222-222222222223',
    fullName: 'Abena Appiah',
    specializations: ['STATIC GUARD & ASSET PROTECTION', 'VIP ESCORT'],
    operatingLocations: ['Tema Industrial', 'Accra Central', 'Cantonments'],
    hourlyRate: 90,
    trustScore: 94,
    rating: 4.95,
    completedJobsCount: 115,
    verificationStatus: 'verified',
    bio: 'Static guard duty & asset protection specialist. Certified close-quarters protective operative.',
    expertise: ['Asset Protection', 'Access Control', 'First Aid / CPR'],
  },
  {
    id: '22222222-2222-2222-2222-222222222224',
    fullName: 'Emmanuel Tetteh',
    specializations: ['VIP ESCORT & DIPLOMATIC DETAIL', 'MOTORCADE SECURITY'],
    operatingLocations: ['Cantonments', 'Ridge Enclave', 'Airport Residential'],
    hourlyRate: 135,
    trustScore: 98,
    rating: 5.0,
    completedJobsCount: 180,
    verificationStatus: 'verified',
    bio: 'Ex-military close protection officer specializing in diplomatic escorts, motorcade security, and high-threat VIP transport.',
    expertise: ['Diplomatic Escort', 'Motorcade', 'Advanced Defensive Driving'],
  },
  {
    id: '22222222-2222-2222-2222-222222222225',
    fullName: 'Grace Adjei',
    specializations: ['EXECUTIVE PROTECTION', 'EVENT ACCESS MONITORING'],
    operatingLocations: ['East Legon', 'Airport Area', 'Labone'],
    hourlyRate: 110,
    trustScore: 95,
    rating: 4.9,
    completedJobsCount: 104,
    verificationStatus: 'verified',
    bio: 'Executive protection specialist trained in covert surveillance detection, access point management, and female VIP close protection.',
    expertise: ['Executive Protection', 'Surveillance', 'Access Control'],
  },
  {
    id: '22222222-2222-2222-2222-222222222226',
    fullName: 'Yaw Baah',
    specializations: ['STATIC GUARD & WAREHOUSE SECURITY', 'NIGHT PATROL'],
    operatingLocations: ['Spintex Industrial', 'Tema Harbor Zone', 'Achimota'],
    hourlyRate: 75,
    trustScore: 91,
    rating: 4.75,
    completedJobsCount: 86,
    verificationStatus: 'verified',
    bio: 'Industrial security and warehouse perimeter specialist experienced in night patrol surveillance and asset loss prevention.',
    expertise: ['Industrial Security', 'Night Patrol', 'Loss Prevention'],
  },
];

export default function BrowseProfessionalsScreen() {
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [guards, setGuards] = useState<any[]>(MOCK_GUARDS);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const fetchGuards = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<any>('/api/professionals');
        let fetchedList: any[] = [];
        if (res?.content && Array.isArray(res.content)) {
          fetchedList = res.content;
        } else if (Array.isArray(res)) {
          fetchedList = res;
        }

        if (fetchedList.length > 0) {
          setGuards(fetchedList);
        }
      } catch {
        // Keep initial seeded mock guards
      } finally {
        setLoading(false);
      }
    };
    fetchGuards();
  }, []);

  const filteredGuards = guards.filter((guard) => {
    const name = guard.fullName || guard.name || '';
    const specs = Array.isArray(guard.specializations)
      ? guard.specializations.join(' ')
      : String(guard.specialization || '');
    const locs = Array.isArray(guard.operatingLocations)
      ? guard.operatingLocations.join(' ')
      : String(guard.operatingLocations || '');

    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      specs.toLowerCase().includes(searchQuery.toLowerCase()) ||
      locs.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'ALL') return matchesSearch;
    return matchesSearch && specs.toUpperCase().includes(activeFilter);
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack={false} rightIcon="notifications" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search & Filter Header */}
        <View style={styles.searchSection}>
          <SentriText variant="h1" style={styles.heading}>
            Browse Professionals
          </SentriText>

          <View style={styles.searchBar}>
            <Icon name="search" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="SEARCH BY NAME, LOCATION OR SPECIALIZATION..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            <View style={styles.chipRow}>
              {FILTERS.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setActiveFilter(filter)}
                    activeOpacity={0.8}
                  >
                    <SentriText
                      variant="monoSmall"
                      color={isActive ? Colors.background : Colors.textSecondary}
                      style={styles.chipText}
                    >
                      {filter}
                    </SentriText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Beefed-Up Guard List */}
        <View style={styles.guardList}>
          {filteredGuards.map((guard) => {
            const displayName = guard.fullName || guard.name || 'Tactical Guard';
            const displaySpecs = Array.isArray(guard.specializations) && guard.specializations.length > 0
              ? guard.specializations[0]
              : (guard.specialization || 'VIP ESCORT & CLOSE PROTECTION');
            const displayLocations = Array.isArray(guard.operatingLocations) && guard.operatingLocations.length > 0
              ? guard.operatingLocations.join(' • ')
              : 'Accra Central • East Legon';
            const displayRate = guard.hourlyRate ? `GHS ${guard.hourlyRate}` : 'GHS 100';
            const displayScore = guard.trustScore ?? guard.score ?? 96;
            const displayRating = guard.rating || (displayScore >= 95 ? 4.9 : 4.8);
            const completedJobs = guard.completedJobsCount || 120;
            const isVerified = guard.verificationStatus === 'verified' || guard.verified === true;
            const bioText = guard.bio || 'Tactical security operative trained in crowd control, VIP escort, and perimeter access monitoring.';
            const expertiseList: string[] = Array.isArray(guard.expertise) && guard.expertise.length > 0
              ? guard.expertise
              : Array.isArray(guard.specializations)
              ? guard.specializations.slice(0, 3)
              : ['Close Protection', 'Perimeter Control', 'Tactical Security'];

            return (
              <TacticalCard
                key={guard.id || displayName}
                interactive
                onPress={() => router.push(`/(client)/browse/${guard.id}` as any)}
                backgroundColor={Colors.surface}
                borderColor={Colors.border}
                accentColor={Colors.gold}
                style={styles.guardCard}
              >
                {/* Top Row: Avatar, Name, Verified Badge & Specialization */}
                <View style={styles.cardTop}>
                  <View style={styles.avatarBox}>
                    <Icon name="person" size={26} color={Colors.gold} />
                  </View>

                  <View style={styles.cardHeaderInfo}>
                    <View style={styles.nameRow}>
                      <SentriText variant="h3" style={styles.guardName}>
                        {displayName}
                      </SentriText>
                      {isVerified && (
                        <View style={styles.verifiedBadge}>
                          <Icon name="shield-checkmark" size={13} color={Colors.badgeText} />
                          <SentriText variant="caption" color={Colors.badgeText} style={styles.verifiedText}>
                            VERIFIED
                          </SentriText>
                        </View>
                      )}
                    </View>

                    <SentriText variant="monoSmall" color={Colors.gold} style={styles.specText}>
                      {displaySpecs}
                    </SentriText>
                  </View>
                </View>

                {/* Performance Metrics Row: Trust Score & Star Rating */}
                <View style={styles.metricsRow}>
                  <View style={styles.trustScorePill}>
                    <Icon name="shield" size={14} color={Colors.gold} />
                    <SentriText variant="mono" color={Colors.gold} style={styles.metricValText}>
                      {displayScore}
                    </SentriText>
                    <SentriText variant="caption" color={Colors.textMuted}>/100 TRUST</SentriText>
                  </View>

                  <View style={styles.ratingPill}>
                    <Icon name="star" size={14} color={Colors.gold} />
                    <SentriText variant="mono" color={Colors.text}>
                      {displayRating}
                    </SentriText>
                    <SentriText variant="caption" color={Colors.textMuted}>
                      ({completedJobs} Ops)
                    </SentriText>
                  </View>
                </View>

                {/* Operating Locations */}
                <View style={styles.locationRow}>
                  <Icon name="location" size={14} color={Colors.textSecondary} />
                  <SentriText variant="caption" color={Colors.textSecondary} numberOfLines={1}>
                    {displayLocations}
                  </SentriText>
                </View>

                {/* Bio Excerpt */}
                <SentriText variant="body" color={Colors.textSecondary} numberOfLines={2} style={styles.bioText}>
                  {bioText}
                </SentriText>

                {/* Expertise Chips */}
                <View style={styles.expertiseRow}>
                  {expertiseList.map((item, idx) => (
                    <View key={idx} style={styles.expertiseChip}>
                      <SentriText variant="caption" color={Colors.textMuted} style={styles.expertiseChipText}>
                        {item}
                      </SentriText>
                    </View>
                  ))}
                </View>

                {/* Bottom Footer Row: Hourly Rate & Action Indicator */}
                <View style={styles.cardBottom}>
                  <View style={styles.rateBox}>
                    <SentriText variant="caption" color={Colors.textSecondary}>HOURLY RATE</SentriText>
                    <SentriText variant="h3" color={Colors.gold} style={styles.rateValText}>
                      {displayRate} / HR
                    </SentriText>
                  </View>

                  <View style={styles.viewProfileLink}>
                    <SentriText variant="monoSmall" color={Colors.gold}>VIEW PROFILE</SentriText>
                    <Icon name="chevron-forward" size={16} color={Colors.gold} />
                  </View>
                </View>
              </TacticalCard>
            );
          })}
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
  searchSection: {
    marginBottom: Spacing.md,
  },
  heading: {
    fontSize: 24,
    marginBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    height: 48,
    gap: 10,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
  },
  chipScroll: {
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  guardList: {
    gap: Spacing.md,
  },
  guardCard: {
    padding: Spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.xs,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  guardName: {
    fontSize: 17,
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
  specText: {
    fontSize: 11,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: Spacing.xs,
  },
  trustScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricValText: {
    fontSize: 13,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  bioText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
  expertiseRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.md,
  },
  expertiseChip: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  expertiseChipText: {
    fontSize: 10,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rateBox: {
    gap: 2,
  },
  rateValText: {
    fontSize: 16,
  },
  viewProfileLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
