import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriButton } from '@/components/ui/SentriButton';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { TacticalCard } from '@/components/ui/TacticalCard';
import { Icon } from '@/components/ui/Icon';
import { apiClient } from '@/lib/apiClient';

export default function ClientActiveJobScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookingId = (params.id as string) || '44444444-4444-4444-4444-444444444441';

  const [booking, setBooking] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Pulse animation for LIVE indicator
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const fetchData = async () => {
      setLoading(true);
      try {
        const bRes = await apiClient.get<any>(`/api/bookings/${bookingId}`);
        if (bRes) setBooking(bRes);
      } catch {
        // Fallback for mock view
      }

      try {
        const iRes = await apiClient.get<any[]>(`/api/incidents/booking/${bookingId}`);
        if (iRes && Array.isArray(iRes)) setIncidents(iRes);
      } catch {
        // Fallback mock incidents
        setIncidents([
          {
            id: 'inc_1',
            severity: 'High',
            incidentType: 'CRITICAL ALERT',
            description: 'Motion detected at North Gate perimeter zone. Assigned guard responding.',
            loggedAt: '10:45 PM',
          },
          {
            id: 'inc_2',
            severity: 'Low',
            incidentType: 'UPDATE',
            description: 'Perimeter check completed. All clearance checks normal.',
            loggedAt: '10:42 PM',
          },
          {
            id: 'inc_3',
            severity: 'Low',
            incidentType: 'SYSTEM',
            description: 'Geofence sector locked. Periodic checkin verified.',
            loggedAt: '10:15 PM',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack rightIcon="notifications" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header & Live Status Pill */}
        <View style={styles.headerSection}>
          <SentriText variant="h1" style={styles.heading}>
            Active Deployment
          </SentriText>
          <View style={styles.liveStatusRow}>
            <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
            <SentriText variant="monoSmall" color={Colors.danger} style={styles.liveText}>
              STATUS: LIVE MONITORING
            </SentriText>
          </View>
        </View>

        {/* Hero Satellite Sector Card */}
        <TacticalCard
          backgroundColor={Colors.surface}
          borderColor={Colors.border}
          accentColor={Colors.gold}
          style={styles.mapCard}
        >
          <View style={styles.mapHeaderRow}>
            <Icon name="location" size={18} color={Colors.gold} />
            <View style={styles.mapHeaderText}>
              <SentriText variant="monoSmall" color={Colors.gold}>SECTOR ALPHA // GEOFENCED</SentriText>
              <SentriText variant="monoSmall" color={Colors.textSecondary}>
                COORDS: 5.6037° N, 0.1870° W
              </SentriText>
            </View>
          </View>

          <View style={styles.jobDetailGrid}>
            <View style={styles.detailCol}>
              <SentriText variant="caption" color={Colors.textSecondary}>LOCATION</SentriText>
              <SentriText variant="body" color={Colors.text}>
                {booking?.location || 'Labadi Beach Resort, Accra'}
              </SentriText>
            </View>
            <View style={styles.detailCol}>
              <SentriText variant="caption" color={Colors.textSecondary}>STATUS</SentriText>
              <SentriText variant="mono" color={Colors.textSuccess}>
                {(booking?.status || 'ACTIVE').toUpperCase()}
              </SentriText>
            </View>
          </View>
        </TacticalCard>

        {/* Incident Feed Section */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            INCIDENT & ACTIVITY FEED
          </SentriText>
        </View>

        <View style={styles.feedList}>
          {(incidents.length > 0 ? incidents : [
            {
              id: 'inc_1',
              severity: 'High',
              incidentType: 'CRITICAL ALERT',
              description: 'Motion detected at North Gate perimeter zone. Guard responding.',
              loggedAt: '10:45 PM',
            },
            {
              id: 'inc_2',
              severity: 'Low',
              incidentType: 'UPDATE',
              description: 'Perimeter check completed. All clearance checks normal.',
              loggedAt: '10:42 PM',
            },
          ]).map((item) => {
            const isHigh = item.severity === 'High';
            const statusColor = isHigh ? Colors.danger : item.incidentType === 'UPDATE' ? Colors.gold : Colors.textMuted;
            const iconName = isHigh ? 'alert-triangle' : item.incidentType === 'UPDATE' ? 'shield-checkmark' : 'lock';

            return (
              <TacticalCard
                key={item.id || item.loggedAt}
                backgroundColor={Colors.surfaceElevated}
                borderColor={Colors.border}
                accentColor={statusColor}
                style={styles.feedCard}
              >
                <View style={styles.feedRow}>
                  <Icon name={iconName} size={20} color={statusColor} style={styles.feedIcon} />
                  <View style={styles.feedContent}>
                    <View style={styles.feedTopLine}>
                      <SentriText variant="monoSmall" color={statusColor} style={styles.feedTag}>
                        {item.incidentType || 'INCIDENT'}
                      </SentriText>
                      <SentriText variant="monoSmall" color={Colors.textMuted}>
                        {item.loggedAt || 'JUST NOW'}
                      </SentriText>
                    </View>
                    <SentriText variant="body" color={Colors.text} style={styles.feedDesc}>
                      {item.description}
                    </SentriText>
                  </View>
                </View>
              </TacticalCard>
            );
          })}
        </View>

        {/* Emergency Action */}
        <View style={styles.actionSection}>
          <SentriButton
            title="EMERGENCY SUPPORT"
            variant="danger"
            size="md"
            onPress={() => router.push('/shared/call' as any)}
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
  heading: {
    fontSize: 26,
    marginBottom: 4,
  },
  liveStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.danger,
  },
  liveText: {
    fontSize: 11,
    letterSpacing: 1,
  },
  mapCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.md,
  },
  mapHeaderText: {
    flex: 1,
  },
  jobDetailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detailCol: {
    gap: 4,
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1,
  },
  feedList: {
    gap: 12,
    marginBottom: Spacing.lg,
  },
  feedCard: {
    padding: Spacing.md,
  },
  feedRow: {
    flexDirection: 'row',
    gap: 12,
  },
  feedIcon: {
    marginTop: 2,
  },
  feedContent: {
    flex: 1,
  },
  feedTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  feedTag: {
    fontSize: 11,
    letterSpacing: 1,
  },
  feedDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionSection: {
    marginTop: Spacing.md,
  },
});
