import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { TacticalCard } from '@/components/ui/TacticalCard';
import { Icon } from '@/components/ui/Icon';

const INCOMING_OFFERS = [
  {
    id: 'req_101',
    title: 'Labadi Beach Event Guarding',
    subtitle: 'VIP Entrance Escort & Access Control',
    location: 'Labadi Beach Resort, Accra',
    timeRange: '18:00 - 00:00 (6 Hours)',
    pay: 'GHS 720.00',
    rate: 'GHS 120/hr',
    clientName: 'Labadi Event Planners Ltd',
    urgent: true,
  },
  {
    id: 'req_102',
    title: 'Airport Area VIP Escort',
    subtitle: 'Executive Arrival Close Protection',
    location: 'Airport Residential, Accra',
    timeRange: '08:00 - 12:00 (4 Hours)',
    pay: 'GHS 600.00',
    rate: 'GHS 150/hr',
    clientName: 'Kwame Darko (Private Client)',
    urgent: false,
  },
  {
    id: 'req_103',
    title: 'Osu Nightclub Perimeter Detail',
    subtitle: 'Crowd Management & Entry Security',
    location: 'Oxford Street, Osu, Accra',
    timeRange: '21:00 - 03:00 (6 Hours)',
    pay: 'GHS 660.00',
    rate: 'GHS 110/hr',
    clientName: 'Osu Entertainment Hub',
    urgent: false,
  },
];

export default function ProfessionalOffersScreen() {
  const router = useRouter();
  const [offers, setOffers] = useState(INCOMING_OFFERS);

  const handleAccept = (offer: any) => {
    Alert.alert('Dispatch Accepted!', `You have accepted dispatch for "${offer.title}". Opening mission briefing...`, [
      {
        text: 'Proceed to Briefing',
        onPress: () => router.push(`/(pro)/home/request/${offer.id}/accept` as any),
      },
    ]);
  };

  const handleDecline = (offerId: string) => {
    setOffers(offers.filter((o) => o.id !== offerId));
    Alert.alert('Offer Declined', 'The dispatch request has been removed from your queue.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack={false} rightIcon="notifications" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Title */}
        <View style={styles.headerSection}>
          <SentriText variant="monoSmall" color={Colors.gold} style={styles.stepTag}>
            INCOMING DISPATCH OFFERS
          </SentriText>
          <SentriText variant="h1" style={styles.mainHeading}>
            Dispatch Offers
          </SentriText>
          <SentriText variant="body" color={Colors.textSecondary}>
            Review available job offers in your coverage sector and accept dispatches.
          </SentriText>
        </View>

        {/* Offers List */}
        {offers.length === 0 ? (
          <TacticalCard backgroundColor={Colors.surface} style={styles.emptyCard}>
            <Icon name="checkmark-circle" size={32} color={Colors.textSuccess} />
            <SentriText variant="h3" style={styles.emptyTitle}>Queue Cleared</SentriText>
            <SentriText variant="caption" color={Colors.textMuted} align="center">
              No pending dispatch offers right now. Check back soon or ensure your status is ACTIVE ON DUTY.
            </SentriText>
          </TacticalCard>
        ) : (
          <View style={styles.offersList}>
            {offers.map((offer) => (
              <TacticalCard
                key={offer.id}
                backgroundColor={Colors.surface}
                borderColor={offer.urgent ? Colors.gold : Colors.border}
                style={styles.offerCard}
              >
                {/* Header Row */}
                <View style={styles.cardHeader}>
                  <View style={styles.titleGroup}>
                    <Icon name="shield-checkmark" size={18} color={Colors.gold} />
                    <SentriText variant="h3" style={styles.offerTitle}>
                      {offer.title}
                    </SentriText>
                  </View>

                  <View style={styles.payBadge}>
                    <SentriText variant="h3" color={Colors.gold}>
                      {offer.pay}
                    </SentriText>
                  </View>
                </View>

                {/* Subtitle & Details */}
                <SentriText variant="monoSmall" color={Colors.gold} style={styles.offerSub}>
                  {offer.subtitle} • {offer.rate}
                </SentriText>

                <View style={styles.metaBox}>
                  <View style={styles.metaRow}>
                    <Icon name="location" size={14} color={Colors.textSecondary} />
                    <SentriText variant="caption" color={Colors.textSecondary}>
                      {offer.location}
                    </SentriText>
                  </View>

                  <View style={styles.metaRow}>
                    <Icon name="time" size={14} color={Colors.textSecondary} />
                    <SentriText variant="caption" color={Colors.textSecondary}>
                      {offer.timeRange}
                    </SentriText>
                  </View>

                  <View style={styles.metaRow}>
                    <Icon name="user" size={14} color={Colors.textSecondary} />
                    <SentriText variant="caption" color={Colors.textMuted}>
                      Client: {offer.clientName}
                    </SentriText>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAccept(offer)}
                    activeOpacity={0.8}
                  >
                    <Icon name="checkmark-circle" size={16} color={Colors.background} />
                    <SentriText variant="monoSmall" color={Colors.background} style={styles.btnText}>
                      ACCEPT DISPATCH
                    </SentriText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={() => handleDecline(offer.id)}
                    activeOpacity={0.8}
                  >
                    <SentriText variant="caption" color={Colors.danger}>DECLINE</SentriText>
                  </TouchableOpacity>
                </View>
              </TacticalCard>
            ))}
          </View>
        )}
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
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
  },
  offersList: {
    gap: Spacing.md,
  },
  offerCard: {
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  offerTitle: {
    fontSize: 16,
  },
  payBadge: {
    paddingHorizontal: 6,
  },
  offerSub: {
    fontSize: 11,
    marginBottom: Spacing.xs,
  },
  metaBox: {
    gap: 4,
    marginVertical: Spacing.xs,
    paddingVertical: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.gold,
    paddingVertical: 10,
    borderRadius: 6,
  },
  btnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  declineBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
