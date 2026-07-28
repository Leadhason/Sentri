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
  'VIP Bodyguard / Escort',
  'Crowd Control & Venue',
  'Static Guard Duty',
  'Event Perimeter Security',
  'Emergency Tactical Response',
  'Asset Protection',
];

const LOCATIONS = ['Accra Central', 'Kumasi', 'Tema Industrial', 'Takoradi Port', 'East Legon'];

export default function ProSetupScreen() {
  const router = useRouter();
  const { syncProfile } = useAuth();

  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([
    'Event Perimeter Security',
    'Static Guard Duty',
  ]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([
    'Accra Central',
    'East Legon',
  ]);
  const [hourlyRate, setHourlyRate] = useState('75');
  const [bio, setBio] = useState(
    '5+ years experience in venue access management and armed VIP security detail.'
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
      hourlyRate: parseFloat(hourlyRate) || 50,
      specializations: selectedSpecs,
      operatingLocations: selectedLocations,
    });
    setLoading(false);
    router.replace('/(pro)/home' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Step Banner */}
        <View style={styles.banner}>
          <SentriText variant="mono" color={Colors.gold} style={styles.stepTag}>
            STEP 02 // GUARD PROFILE & SPECIALIZATIONS
          </SentriText>
          <SentriText variant="h1" style={styles.heading}>
            Professional Setup
          </SentriText>
          <SentriText variant="body" color={Colors.textSecondary}>
            Configure your hourly rates and operational details for client discovery.
          </SentriText>
        </View>

        {/* Specializations Chip Grid */}
        <View style={styles.section}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionLabel}>
            SPECIALIZATIONS (SELECT ALL THAT APPLY)
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
                    name={isSelected ? 'checkmark' : 'shield'}
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

        {/* Hourly Rate Input */}
        <View style={styles.section}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionLabel}>
            BASE HOURLY RATE (GHS / HOUR) *
          </SentriText>
          <TacticalCard backgroundColor={Colors.surface}>
            <View style={styles.rateRow}>
              <SentriText variant="h2" color={Colors.gold} style={styles.currencySymbol}>
                GHS
              </SentriText>
              <TextInput
                style={styles.rateInput}
                keyboardType="numeric"
                value={hourlyRate}
                onChangeText={setHourlyRate}
                placeholder="75"
                placeholderTextColor={Colors.textMuted}
              />
              <SentriText variant="mono" color={Colors.textMuted}>
                / HR
              </SentriText>
            </View>
          </TacticalCard>
        </View>

        {/* Operating Locations */}
        <View style={styles.section}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionLabel}>
            OPERATING REGIONS
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

        {/* Bio Input */}
        <View style={styles.section}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionLabel}>
            TACTICAL SUMMARY & EXPERIENCE
          </SentriText>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              value={bio}
              onChangeText={setBio}
              placeholder="Detail your security background, certifications, or military service..."
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        </View>

        {/* Submit */}
        <SentriButton
          title="Complete Profile & Verify →"
          variant="primary"
          size="lg"
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
  },
  banner: {
    marginBottom: Spacing.md,
  },
  stepTag: {
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 4,
  },
  heading: {
    marginBottom: 4,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
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
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeChip: {
    backgroundColor: 'rgba(240, 167, 59, 0.15)',
    borderColor: Colors.gold,
  },
  chipText: {
    fontSize: 13,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currencySymbol: {
    fontSize: 22,
  },
  rateInput: {
    flex: 1,
    fontSize: 24,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: Colors.text,
  },
  textAreaContainer: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
  },
  textArea: {
    color: Colors.text,
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
});
