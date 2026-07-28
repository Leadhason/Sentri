import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { DispatchTicket } from '@/components/ui/DispatchTicket';

export default function ClientActivityScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack={false} rightIcon="notifications" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <SentriText variant="h1" style={styles.mainHeading}>
            Activity & Deployments
          </SentriText>
        </View>

        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.uppercaseLabel}>
            ACTIVE DEPLOYMENTS
          </SentriText>
        </View>

        <DispatchTicket
          title="Labadi Beach Event Guarding"
          subtitle="4 Guards Assigned • 0 Anomalies Flagged"
          location="Labadi, Accra"
          timeRange="18:00 - 02:00"
          statusTag="LIVE GEOFENCE"
          statusColor={Colors.gold}
          priceTag="GHS 1,200"
        />

        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.uppercaseLabel}>
            COMPLETED OPERATIONS
          </SentriText>
        </View>

        <DispatchTicket
          title="Airport Area Private Escort"
          subtitle="2 Guards Assigned • Shift Completed"
          location="Airport Residential, Accra"
          timeRange="08:00 - 16:00"
          statusTag="CLOSED"
          statusColor={Colors.textMuted}
          priceTag="GHS 600"
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
  headerSection: {
    marginVertical: Spacing.md,
  },
  mainHeading: {
    fontSize: 24,
  },
  sectionHeader: {
    marginTop: Spacing.md,
    marginBottom: 8,
  },
  uppercaseLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
});
