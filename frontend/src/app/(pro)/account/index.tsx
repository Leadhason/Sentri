import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { TacticalCard } from '@/components/ui/TacticalCard';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/context/AuthContext';

export default function ProfessionalProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [dispatchAlerts, setDispatchAlerts] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);

  const handleLogout = async () => {
    const doLogout = async () => {
      await logout();
      router.replace('/splash' as any);
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to log out of your professional account?');
      if (confirmed) {
        await doLogout();
      }
    } else {
      Alert.alert('Log Out', 'Are you sure you want to log out of your professional account?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: doLogout,
        },
      ]);
    }
  };

  const proName = user?.fullName || 'Kwame Mensah';
  const proEmail = user?.email || 'pro.kwame@sentri.com';
  const proPhone = user?.phone || '+233 24 111 2222';

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack={false} rightIcon="notifications" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Title */}
        <View style={styles.headerSection}>
          <SentriText variant="monoSmall" color={Colors.gold} style={styles.stepTag}>
            PROFESSIONAL ACCOUNT
          </SentriText>
          <SentriText variant="h1" style={styles.mainHeading}>
            My Profile
          </SentriText>
        </View>

        {/* 1. Professional Profile Card */}
        <TacticalCard
          backgroundColor={Colors.surface}
          borderColor={Colors.gold}
          accentColor={Colors.gold}
          style={styles.profileCard}
        >
          <View style={styles.userRow}>
            <View style={styles.avatarBox}>
              <SentriText variant="h2" color={Colors.gold}>
                {proName.charAt(0).toUpperCase()}
              </SentriText>
            </View>

            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <SentriText variant="h2" style={styles.userName}>
                  {proName}
                </SentriText>
                <View style={styles.verifiedBadge}>
                  <Icon name="shield-checkmark" size={14} color={Colors.gold} />
                  <SentriText variant="caption" color={Colors.gold} style={styles.verifiedText}>
                    VERIFIED PRO
                  </SentriText>
                </View>
              </View>

              <SentriText variant="body" color={Colors.textSecondary} style={styles.userEmail}>
                {proEmail}
              </SentriText>
              <SentriText variant="caption" color={Colors.textMuted}>
                {proPhone}
              </SentriText>
            </View>
          </View>

          {/* Trust Score & Earnings Banner */}
          <View style={styles.metricsBanner}>
            <View style={styles.metricCol}>
              <SentriText variant="caption" color={Colors.textSecondary}>TRUST SCORE</SentriText>
              <SentriText variant="h3" color={Colors.gold}>96/100</SentriText>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricCol}>
              <SentriText variant="caption" color={Colors.textSecondary}>HOURLY RATE</SentriText>
              <SentriText variant="h3" color={Colors.text}>GHS 120/HR</SentriText>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricCol}>
              <SentriText variant="caption" color={Colors.textSecondary}>JOBS DONE</SentriText>
              <SentriText variant="h3" color={Colors.textSuccess}>142 Ops</SentriText>
            </View>
          </View>
        </TacticalCard>

        {/* 2. Trust Score & Compliance Section */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            TRUST SCORE & COMPLIANCE
          </SentriText>
        </View>

        <TacticalCard backgroundColor={Colors.surface} style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(pro)/score' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconCircle}>
                <Icon name="star" size={18} color={Colors.gold} />
              </View>
              <View>
                <SentriText variant="body" color={Colors.text} style={styles.menuLabel}>
                  Trust Score Breakdown (96/100)
                </SentriText>
                <SentriText variant="caption" color={Colors.textMuted}>
                  99% Punctuality • 4.9 ★ Ratings • 0 Incidents
                </SentriText>
              </View>
            </View>
            <Icon name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(pro)/account/documents' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconCircle}>
                <Icon name="shield-checkmark" size={18} color={Colors.gold} />
              </View>
              <View>
                <SentriText variant="body" color={Colors.text} style={styles.menuLabel}>
                  Verification Document Vault
                </SentriText>
                <SentriText variant="caption" color={Colors.textMuted}>
                  Ghana Card, Security License L2, Police CID
                </SentriText>
              </View>
            </View>
            <Icon name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Bank Payout Settings', 'Connected Bank: GCB Bank • Mobile Money: MTN MoMo 024***2222')}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconCircle}>
                <Icon name="wallet" size={18} color={Colors.gold} />
              </View>
              <View>
                <SentriText variant="body" color={Colors.text} style={styles.menuLabel}>
                  Bank & Mobile Money Payouts
                </SentriText>
                <SentriText variant="caption" color={Colors.textMuted}>
                  Weekly Paystack automatic transfers
                </SentriText>
              </View>
            </View>
            <Icon name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </TacticalCard>

        {/* 3. Dispatch & Location Settings */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            DISPATCH PREFERENCES
          </SentriText>
        </View>

        <TacticalCard backgroundColor={Colors.surface} style={styles.menuCard}>
          <View style={styles.switchItem}>
            <View style={styles.menuLeft}>
              <View style={styles.iconCircle}>
                <Icon name="notifications" size={18} color={Colors.gold} />
              </View>
              <View>
                <SentriText variant="body" color={Colors.text} style={styles.menuLabel}>
                  Instant Dispatch Alerts
                </SentriText>
                <SentriText variant="caption" color={Colors.textMuted}>
                  Receive urgent job requests in your sector
                </SentriText>
              </View>
            </View>
            <Switch
              value={dispatchAlerts}
              onValueChange={setDispatchAlerts}
              trackColor={{ false: Colors.border, true: 'rgba(240, 167, 59, 0.4)' }}
              thumbColor={dispatchAlerts ? Colors.gold : Colors.textMuted}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchItem}>
            <View style={styles.menuLeft}>
              <View style={styles.iconCircle}>
                <Icon name="location" size={18} color={Colors.gold} />
              </View>
              <View>
                <SentriText variant="body" color={Colors.text} style={styles.menuLabel}>
                  Live Geofence GPS
                </SentriText>
                <SentriText variant="caption" color={Colors.textMuted}>
                  Enable active shift location verification
                </SentriText>
              </View>
            </View>
            <Switch
              value={locationTracking}
              onValueChange={setLocationTracking}
              trackColor={{ false: Colors.border, true: 'rgba(240, 167, 59, 0.4)' }}
              thumbColor={locationTracking ? Colors.gold : Colors.textMuted}
            />
          </View>
        </TacticalCard>

        {/* 4. Log Out Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Icon name="log-out" size={18} color={Colors.danger} />
            <SentriText variant="mono" color={Colors.danger} style={styles.logoutText}>
              LOG OUT PROFESSIONAL SESSION
            </SentriText>
          </TouchableOpacity>
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
  mainHeading: {
    fontSize: 26,
  },
  profileCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: Spacing.md,
  },
  avatarBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(240, 167, 59, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.gold,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  userName: {
    fontSize: 18,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(240, 167, 59, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(240, 167, 59, 0.3)',
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
  },
  metricsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  metricCol: {
    alignItems: 'center',
    gap: 2,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  sectionHeader: {
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1,
  },
  menuCard: {
    paddingVertical: 4,
    marginBottom: Spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  logoutSection: {
    marginTop: Spacing.sm,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.dangerMuted,
    borderWidth: 1,
    borderColor: Colors.danger,
    paddingVertical: 14,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
