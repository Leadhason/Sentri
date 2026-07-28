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
    hourlyRate: 120,
    trustScore: 96,
    completedJobsCount: 142,
    verificationStatus: 'verified',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    fullName: 'Kofi Owusu',
    specializations: ['CROWD CONTROL & VENUE', 'STATIC GUARD DUTY'],
    hourlyRate: 85,
    trustScore: 92,
    completedJobsCount: 98,
    verificationStatus: 'verified',
  },
  {
    id: '22222222-2222-2222-2222-222222222223',
    fullName: 'Abena Appiah',
    specializations: ['STATIC GUARD & ASSET PROTECTION', 'VIP ESCORT'],
    hourlyRate: 90,
    trustScore: 94,
    completedJobsCount: 115,
    verificationStatus: 'verified',
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

    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      specs.toLowerCase().includes(searchQuery.toLowerCase());

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
              placeholder="SEARCH BY NAME OR SPECIALIZATION..."
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

        {/* Guard List */}
        <View style={styles.guardList}>
          {filteredGuards.map((guard) => {
            const displayName = guard.fullName || guard.name || 'Tactical Guard';
            const displaySpecs = Array.isArray(guard.specializations) && guard.specializations.length > 0
              ? guard.specializations[0]
              : (guard.specialization || 'VIP ESCORT & CLOSE PROTECTION');
            const displayRate = guard.hourlyRate ? `GHS ${guard.hourlyRate}/HR` : (guard.rate || 'GHS 100/HR');
            const displayScore = guard.trustScore ?? guard.score ?? 96;
            const isVerified = guard.verificationStatus === 'verified' || guard.verified === true;

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
                <View style={styles.cardTop}>
                  <View style={styles.avatarBox}>
                    <Icon name="person" size={24} color={Colors.gold} />
                  </View>

                  <View style={styles.cardHeaderInfo}>
                    <View style={styles.nameRow}>
                      <SentriText variant="h3" style={styles.guardName}>
                        {displayName}
                      </SentriText>
                      {isVerified && (
                        <Icon name="shield-checkmark" size={16} color={Colors.gold} />
                      )}
                    </View>
                    <SentriText variant="monoSmall" color={Colors.gold}>
                      {displaySpecs}
                    </SentriText>
                  </View>
                </View>

                <View style={styles.cardBottom}>
                  <View>
                    <SentriText variant="monoSmall" color={Colors.textSecondary}>RATE</SentriText>
                    <SentriText variant="mono" color={Colors.text}>{displayRate}</SentriText>
                  </View>

                  <View style={styles.scoreBadge}>
                    <Icon name="star" size={14} color={Colors.gold} />
                    <SentriText variant="mono" color={Colors.gold}>{displayScore}</SentriText>
                    <SentriText variant="caption" color={Colors.textMuted}>/100</SentriText>
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
    fontSize: 12,
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
    gap: Spacing.sm,
  },
  guardCard: {
    padding: Spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.md,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    gap: 6,
  },
  guardName: {
    fontSize: 16,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
