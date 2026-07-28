import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriButton } from '@/components/ui/SentriButton';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { TacticalCard } from '@/components/ui/TacticalCard';
import { Icon } from '@/components/ui/Icon';

export default function BookingRequestDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  const handleAccept = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push(`/(pro)/home/request/${params.id}/accept` as any);
    }, 600);
  };

  const handleDecline = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack rightIcon={undefined} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <View style={styles.headerSection}>
          <SentriText variant="monoSmall" color={Colors.gold} style={styles.stepTag}>
            INCOMING DISPATCH OFFER
          </SentriText>
          <SentriText variant="h1" style={styles.mainHeading}>
            Labadi Beach Event Guarding
          </SentriText>
        </View>

        {/* Total Pay Banner Card */}
        <TacticalCard
          backgroundColor={Colors.surface}
          borderColor={Colors.gold}
          accentColor={Colors.gold}
          style={styles.payCard}
        >
          <View style={styles.payRow}>
            <View>
              <SentriText variant="monoSmall" color={Colors.textSecondary}>TOTAL DISPATCH PAY</SentriText>
              <SentriText variant="h1" color={Colors.gold} style={styles.payText}>
                GHS 720.00
              </SentriText>
            </View>

            <View style={styles.ratePill}>
              <SentriText variant="monoSmall" color={Colors.gold}>GHS 120 / HR</SentriText>
            </View>
          </View>
        </TacticalCard>

        {/* Operation Details Card */}
        <TacticalCard backgroundColor={Colors.surface} style={styles.detailCard}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            ASSIGNMENT SPECIFICATIONS
          </SentriText>

          <View style={styles.specRow}>
            <Icon name="time" size={18} color={Colors.gold} />
            <View style={styles.specTextGroup}>
              <SentriText variant="monoSmall" color={Colors.textSecondary}>DURATION & SHIFT</SentriText>
              <SentriText variant="body" color={Colors.text}>18:00 - 00:00 (6 Hours)</SentriText>
            </View>
          </View>

          <View style={styles.specRow}>
            <Icon name="location" size={18} color={Colors.gold} />
            <View style={styles.specTextGroup}>
              <SentriText variant="monoSmall" color={Colors.textSecondary}>LOCATION</SentriText>
              <SentriText variant="body" color={Colors.text}>Labadi Beach Resort, Accra</SentriText>
            </View>
          </View>

          <View style={styles.specRow}>
            <Icon name="user" size={18} color={Colors.gold} />
            <View style={styles.specTextGroup}>
              <SentriText variant="monoSmall" color={Colors.textSecondary}>CLIENT HOST</SentriText>
              <SentriText variant="body" color={Colors.text}>Kofi Darko (Verified Client)</SentriText>
            </View>
          </View>
        </TacticalCard>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <SentriButton
            title="Accept Dispatch Offer →"
            variant="primary"
            size="md"
            loading={loading}
            onPress={handleAccept}
            style={styles.btnMargin}
          />

          <SentriButton
            title="Decline Offer"
            variant="secondary"
            size="md"
            onPress={handleDecline}
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
  stepTag: {
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  mainHeading: {
    fontSize: 24,
  },
  payCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  payText: {
    fontSize: 32,
    fontWeight: '700',
  },
  ratePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gold,
    backgroundColor: 'rgba(240, 167, 59, 0.12)',
  },
  detailCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  specTextGroup: {
    flex: 1,
  },
  actionSection: {
    alignItems: 'center',
    gap: 10,
  },
  btnMargin: {
    width: '100%',
  },
});
