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
import { SentriButton } from '@/components/ui/SentriButton';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { TacticalCard } from '@/components/ui/TacticalCard';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/context/AuthContext';

const SPECIALIZATIONS = [
  'VIP Close Protection',
  'Event & Venue Security',
  'Static Guard & Asset Protection',
  'Executive Motorcade Escort',
  'Crowd Management',
  'First Aid & CPR Specialist',
];

const LOCATIONS = [
  'Accra Central',
  'East Legon',
  'Airport Residential',
  'Cantonments',
  'Osu & Labone',
  'Labadi & Spintex',
  'Tema Industrial Zone',
  'Kumasi Central',
];

const PRESET_RATES = ['75', '95', '120', '150'];

export default function ProSetupScreen() {
  const router = useRouter();
  const { syncProfile } = useAuth();

  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([
    'VIP Close Protection',
    'Event & Venue Security',
  ]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([
    'Accra Central',
    'East Legon',
    'Airport Residential',
  ]);
  const [hourlyRate, setHourlyRate] = useState('120');
  const [bio, setBio] = useState(
    '5+ years tactical security experience specializing in close VIP bodyguard detail, crowd management, and venue perimeter monitoring.'
  );
  const [loading, setLoading] = useState(false);

  const toggleSpec = (spec: string) => {
    if (selectedSpecs.includes(spec)) {
      setSelectedSpecs(selectedSpecs.filter((s) => s !== spec));
    } else {
      setSelectedSpecs([...selectedSpecs, spec]);
    }
  };

  const toggleLocation = (loc: string) => {
    if (selectedLocations.includes(loc)) {
      setSelectedLocations(selectedLocations.filter((l) => l !== loc));
    } else {
      setSelectedLocations([...selectedLocations, loc]);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    await syncProfile({
      bio,
      hourlyRate: parseFloat(hourlyRate) || 100,
      specializations: selectedSpecs,
      operatingLocations: selectedLocations,
    });
    setLoading(false);
    router.replace('/(pro)/home' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack={false} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressFill} />
        </View>

        {/* Header Section */}
        <View style={styles.headerSection}>
          <SentriText variant="monoSmall" color={Colors.gold} style={styles.stepTag}>
            STEP 2 OF 2 • PROFESSIONAL ONBOARDING
          </SentriText>
          <SentriText variant="h1" style={styles.mainHeading}>
            Set Up Your Profile
          </SentriText>
          <SentriText variant="body" color={Colors.textSecondary}>
            Configure your rates, specializations, and coverage areas so clients can hire you instantly.
          </SentriText>
        </View>

        {/* 1. Specializations Chips */}
        <View style={styles.section}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionLabel}>
            YOUR SPECIALIZATIONS (SELECT ALL THAT APPLY) *
          </SentriText>

          <View style={styles.chipGrid}>
            {SPECIALIZATIONS.map((spec) => {
              const isSelected = selectedSpecs.includes(spec);
              return (
                <TouchableOpacity
                  key={spec}
                  style={[styles.chip, isSelected && styles.activeChip]}
                  onPress={() => toggleSpec(spec)}
                  activeOpacity={0.8}
                >
                  <Icon
                    name={isSelected ? 'shield-checkmark' : 'shield'}
                    size={14}
                    color={isSelected ? Colors.gold : Colors.textMuted}
                  />
                  <SentriText
                    variant="caption"
                    color={isSelected ? Colors.gold : Colors.textSecondary}
                    style={styles.chipText}
                  >
                    {spec}
                  </SentriText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 2. Coverage Locations */}
        <View style={styles.section}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionLabel}>
            OPERATING LOCATIONS & SECTORS *
          </SentriText>

          <View style={styles.chipGrid}>
            {LOCATIONS.map((loc) => {
              const isSelected = selectedLocations.includes(loc);
              return (
                <TouchableOpacity
                  key={loc}
                  style={[styles.chip, isSelected && styles.activeChip]}
                  onPress={() => toggleLocation(loc)}
                  activeOpacity={0.8}
                >
                  <Icon
                    name="location"
                    size={14}
                    color={isSelected ? Colors.gold : Colors.textMuted}
                  />
                  <SentriText
                    variant="caption"
                    color={isSelected ? Colors.gold : Colors.textSecondary}
                    style={styles.chipText}
                  >
                    {loc}
                  </SentriText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. Base Hourly Rate */}
        <View style={styles.section}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionLabel}>
            BASE HOURLY RATE (GHS / HR) *
          </SentriText>

          <TacticalCard backgroundColor={Colors.surface} style={styles.rateCard}>
            <View style={styles.rateRow}>
              <SentriText variant="h2" color={Colors.gold} style={styles.currencyPrefix}>
                GHS
              </SentriText>
              <TextInput
                style={styles.rateInput}
                keyboardType="numeric"
                value={hourlyRate}
                onChangeText={setHourlyRate}
                placeholder="120"
                placeholderTextColor={Colors.textMuted}
              />
              <SentriText variant="mono" color={Colors.textMuted}>
                / HOUR
              </SentriText>
            </View>

            {/* Rate Presets */}
            <View style={styles.presetRow}>
              <SentriText variant="caption" color={Colors.textSecondary} style={styles.presetLabel}>
                QUICK PRESETS:
              </SentriText>
              {PRESET_RATES.map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={[styles.presetBtn, hourlyRate === preset && styles.presetBtnActive]}
                  onPress={() => setHourlyRate(preset)}
                  activeOpacity={0.8}
                >
                  <SentriText
                    variant="caption"
                    color={hourlyRate === preset ? Colors.gold : Colors.textSecondary}
                  >
                    GHS {preset}
                  </SentriText>
                </TouchableOpacity>
              ))}
            </View>
          </TacticalCard>
        </View>

        {/* 4. Bio Summary */}
        <View style={styles.section}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionLabel}>
            PROFESSIONAL SUMMARY & EXPERIENCE *
          </SentriText>

          <View style={styles.textAreaBox}>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              value={bio}
              onChangeText={setBio}
              placeholder="Highlight your security background, military/police experience, CPR certifications, and key strengths..."
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        </View>

        {/* Verification Guarantee Notice */}
        <TacticalCard backgroundColor={Colors.surface} style={styles.noticeCard}>
          <View style={styles.noticeRow}>
            <Icon name="shield-checkmark" size={20} color={Colors.gold} />
            <View style={styles.noticeTextGroup}>
              <SentriText variant="h3" color={Colors.gold}>Instant Profile Indexing</SentriText>
              <SentriText variant="caption" color={Colors.textSecondary}>
                Upon saving, your profile will be published to the client discovery directory for direct booking requests.
              </SentriText>
            </View>
          </View>
        </TacticalCard>

        {/* Submit Button */}
        <SentriButton
          title="SAVE PROFILE & COMPLETE SETUP →"
          variant="primary"
          size="md"
          loading={loading}
          onPress={handleComplete}
          style={styles.submitBtn}
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
  progressContainer: {
    height: 4,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressFill: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.gold,
  },
  headerSection: {
    marginBottom: Spacing.lg,
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
  section: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 8,
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
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeChip: {
    backgroundColor: Colors.badgeBg,
    borderColor: Colors.gold,
  },
  chipText: {
    fontSize: 12,
  },
  rateCard: {
    padding: Spacing.md,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.sm,
  },
  currencyPrefix: {
    fontSize: 20,
    fontWeight: '700',
  },
  rateInput: {
    flex: 1,
    color: Colors.text,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 2,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  presetLabel: {
    fontSize: 10,
  },
  presetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetBtnActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.badgeBg,
  },
  textAreaBox: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
  },
  textArea: {
    color: Colors.text,
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 13,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  noticeCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  noticeRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  noticeTextGroup: {
    flex: 1,
    gap: 2,
  },
  submitBtn: {
    marginTop: Spacing.xs,
  },
});
