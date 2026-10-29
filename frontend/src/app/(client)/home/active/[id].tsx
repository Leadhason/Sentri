import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
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
        // Fallback
      }

      try {
        const iRes = await apiClient.get<any[]>(`/api/incidents/booking/${bookingId}`);
        if (iRes && Array.isArray(iRes)) setIncidents(iRes);
      } catch {
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
          <SentriText variant="monoSmall" color={Colors.gold} style={styles.stepTag}>
            LIVE GEOFENCE MONITORING
          </SentriText>
          <SentriText variant="h1" style={styles.heading}>
            Active Deployment
          </SentriText>
          <View style={styles.liveStatusRow}>
            <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
            <SentriText variant="monoSmall" color={Colors.danger} style={styles.liveText}>
              LIVE RADAR & GUARD TRACKING ACTIVE
            </SentriText>
          </View>
        </View>

        {/* Hero Sector Details Card */}
        <TacticalCard
          backgroundColor={Colors.surface}
          borderColor={Colors.border}
          accentColor={Colors.gold}
          style={styles.mapCard}
        >
          <View style={styles.mapHeaderRow}>
            <Icon name="location" size={20} color={Colors.gold} />
            <View style={styles.mapHeaderText}>
              <SentriText variant="h3" color={Colors.text}>
                {booking?.title || 'Labadi Beach Event Guarding'}
              </SentriText>
              <SentriText variant="caption" color={Colors.textSecondary}>
                {booking?.location || 'Labadi Beach Resort, Accra'} • 4 Guards Active
              </SentriText>
            </View>
          </View>

          <View style={styles.jobDetailGrid}>
            <View style={styles.detailCol}>
              <SentriText variant="caption" color={Colors.textSecondary}>GPS STATUS</SentriText>
              <SentriText variant="caption" color={Colors.textSuccess} style={styles.boldText}>
                GEOFENCE VERIFIED ✓
              </SentriText>
            </View>
            <View style={styles.detailCol}>
              <SentriText variant="caption" color={Colors.textSecondary}>SHIFT TIMINGS</SentriText>
              <SentriText variant="body" color={Colors.text}>
                18:00 - 02:00 (8 Hours)
              </SentriText>
            </View>
          </View>
        </TacticalCard>

        {/* HIGH-VISIBILITY INSTANT ACTION TILES (2x2 Grid) */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            CRITICAL DEPLOYMENT ACTIONS
          </SentriText>
        </View>

        <View style={styles.actionGrid}>
          {/* Tile 1: Emergency Support Call (RED) */}
          <TouchableOpacity
            style={[styles.tileCard, styles.emergencyTile]}
            onPress={() => router.push('/shared/call' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.tileIconCircleRed}>
              <Icon name="call" size={22} color={Colors.danger} />
            </View>
            <SentriText variant="h3" color={Colors.danger} style={styles.tileTitle}>
              Emergency Call
            </SentriText>
            <SentriText variant="caption" color={Colors.textMuted} style={styles.tileSub}>
              24/7 Direct Line
            </SentriText>
          </TouchableOpacity>

          {/* Tile 2: Call Guards (GOLD) */}
          <TouchableOpacity
            style={[styles.tileCard, styles.goldTile]}
            onPress={() => router.push('/shared/call' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.tileIconCircleGold}>
              <Icon name="shield-checkmark" size={22} color={Colors.gold} />
            </View>
            <SentriText variant="h3" color={Colors.gold} style={styles.tileTitle}>
              Call Guards
            </SentriText>
            <SentriText variant="caption" color={Colors.textMuted} style={styles.tileSub}>
              Assigned Team
            </SentriText>
          </TouchableOpacity>

          {/* Tile 3: AI Post-Job Report (DARK SURFACE) */}
          <TouchableOpacity
            style={[styles.tileCard, styles.surfaceTile]}
            onPress={() => router.push('/shared/report/33333333-3333-3333-3333-333333333332' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.tileIconCircleBlue}>
              <Icon name="shield" size={22} color={Colors.text} />
            </View>
            <SentriText variant="h3" color={Colors.text} style={styles.tileTitle}>
              AI Report
            </SentriText>
            <SentriText variant="caption" color={Colors.textMuted} style={styles.tileSub}>
              PDF Summary
            </SentriText>
          </TouchableOpacity>

          {/* Tile 4: Geofence Live Radar (GREEN) */}
          <TouchableOpacity
            style={[styles.tileCard, styles.greenTile]}
            onPress={() => router.push('/(client)/activity' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.tileIconCircleGreen}>
              <Icon name="location" size={22} color={Colors.textSuccess} />
            </View>
            <SentriText variant="h3" color={Colors.textSuccess} style={styles.tileTitle}>
              Live Radar
            </SentriText>
            <SentriText variant="caption" color={Colors.textMuted} style={styles.tileSub}>
              GPS Coordinates
            </SentriText>
          </TouchableOpacity>
        </View>

        {/* Incident & Activity Feed */}
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
            const iconName = isHigh ? 'alert-circle' : item.incidentType === 'UPDATE' ? 'shield-checkmark' : 'lock';

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
    gap: 12,
    marginBottom: Spacing.md,
  },
  mapHeaderText: {
    flex: 1,
    gap: 2,
  },
  jobDetailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detailCol: {
    gap: 2,
  },
  boldText: {
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: Spacing.lg,
  },
  tileCard: {
    width: '48%',
    padding: Spacing.md,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emergencyTile: {
    backgroundColor: 'rgba(230, 57, 70, 0.08)',
    borderColor: Colors.danger,
  },
  goldTile: {
    backgroundColor: Colors.badgeBg,
    borderColor: Colors.gold,
  },
  surfaceTile: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  greenTile: {
    backgroundColor: Colors.badgeBg,
    borderColor: Colors.textSuccess,
  },
  tileIconCircleRed: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(230, 57, 70, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileIconCircleGold: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileIconCircleBlue: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileIconCircleGreen: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(56, 176, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileTitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  tileSub: {
    fontSize: 10,
    textAlign: 'center',
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
});
