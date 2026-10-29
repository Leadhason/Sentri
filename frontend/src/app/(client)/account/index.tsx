import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { TacticalCard } from '@/components/ui/TacticalCard';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/context/AuthContext';

export default function ClientProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Notification Toggles
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);

  const handleLogout = async () => {
    const doLogout = async () => {
      await logout();
      router.replace('/splash' as any);
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to log out of your account?');
      if (confirmed) {
        await doLogout();
      }
    } else {
      Alert.alert('Log Out', 'Are you sure you want to log out of your account?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: doLogout,
        },
      ]);
    }
  };

  const clientName = user?.fullName || 'Kwame Darko';
  const clientEmail = user?.email || 'client.kwame@sentri.com';
  const clientPhone = user?.phone || '+233 24 000 0001';

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack={false} rightIcon="notifications" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Title */}
        <View style={styles.headerSection}>
          <SentriText variant="h1" style={styles.mainHeading}>
            My Profile
          </SentriText>
        </View>

        {/* 1. User Profile Card */}
        <TacticalCard
          backgroundColor={Colors.surface}
          borderColor={Colors.gold}
          accentColor={Colors.gold}
          style={styles.profileCard}
        >
          <View style={styles.userRow}>
            <View style={styles.avatarBox}>
              <SentriText variant="h2" color={Colors.gold}>
                {clientName.charAt(0).toUpperCase()}
              </SentriText>
            </View>

            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <SentriText variant="h2" style={styles.userName}>
                  {clientName}
                </SentriText>
                <View style={styles.verifiedBadge}>
                  <Icon name="shield-checkmark" size={13} color={Colors.badgeText} />
                  <SentriText variant="caption" color={Colors.badgeText} style={styles.verifiedText}>
                    VERIFIED CLIENT
                  </SentriText>
                </View>
              </View>

              <SentriText variant="body" color={Colors.textSecondary} style={styles.userEmail}>
                {clientEmail}
              </SentriText>
              <SentriText variant="caption" color={Colors.textMuted}>
                {clientPhone}
              </SentriText>
            </View>
          </View>

          {/* Credits Summary Banner */}
          <View style={styles.creditsBanner}>
            <View style={styles.creditsLeft}>
              <Icon name="star" size={16} color={Colors.gold} />
              <SentriText variant="monoSmall" color={Colors.textSecondary}>
                ASSESSMENT CREDITS
              </SentriText>
            </View>
            <SentriText variant="mono" color={Colors.gold} style={styles.creditsCount}>
              3 REMAINING
            </SentriText>
          </View>
        </TacticalCard>

        {/* 2. Payment & Billing Section */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            PAYMENTS & BILLING
          </SentriText>
        </View>

        <TacticalCard backgroundColor={Colors.surface} style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Payment Methods', 'Default: Paystack (Visa ending in •••• 4242 & Mobile Money)')}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconCircle}>
                <Icon name="card" size={18} color={Colors.gold} />
              </View>
              <View>
                <SentriText variant="body" color={Colors.text} style={styles.menuLabel}>
                  Payment Methods
                </SentriText>
                <SentriText variant="caption" color={Colors.textMuted}>
                  Paystack • Visa • Mobile Money
                </SentriText>
              </View>
            </View>
            <Icon name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Payment History', 'All job escrows & transaction receipts are secured.')}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconCircle}>
                <Icon name="wallet" size={18} color={Colors.gold} />
              </View>
              <View>
                <SentriText variant="body" color={Colors.text} style={styles.menuLabel}>
                  Escrow & Payment History
                </SentriText>
                <SentriText variant="caption" color={Colors.textMuted}>
                  View receipts and active holds
                </SentriText>
              </View>
            </View>
            <Icon name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </TacticalCard>

        {/* 3. Notifications & Preferences Section */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            NOTIFICATIONS & ALERTS
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
                  Push Notifications
                </SentriText>
                <SentriText variant="caption" color={Colors.textMuted}>
                  Guard status updates & incident alerts
                </SentriText>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: Colors.border, true: 'rgba(240, 167, 59, 0.4)' }}
              thumbColor={pushNotifications ? Colors.gold : Colors.textMuted}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchItem}>
            <View style={styles.menuLeft}>
              <View style={styles.iconCircle}>
                <Icon name="call" size={18} color={Colors.gold} />
              </View>
              <View>
                <SentriText variant="body" color={Colors.text} style={styles.menuLabel}>
                  SMS & Call Alerts
                </SentriText>
                <SentriText variant="caption" color={Colors.textMuted}>
                  Emergency call alerts during active jobs
                </SentriText>
              </View>
            </View>
            <Switch
              value={smsAlerts}
              onValueChange={setSmsAlerts}
              trackColor={{ false: Colors.border, true: 'rgba(240, 167, 59, 0.4)' }}
              thumbColor={smsAlerts ? Colors.gold : Colors.textMuted}
            />
          </View>
        </TacticalCard>

        {/* 4. Security & Settings Section */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            SECURITY & SUPPORT
          </SentriText>
        </View>

        <TacticalCard backgroundColor={Colors.surface} style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Security', 'Password & Two-Factor authentication settings.')}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconCircle}>
                <Icon name="lock" size={18} color={Colors.gold} />
              </View>
              <SentriText variant="body" color={Colors.text} style={styles.menuLabel}>
                Password & Security
              </SentriText>
            </View>
            <Icon name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Sentri Support', 'Contact Sentri 24/7 Customer Support at support@sentrisecurity.com')}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconCircle}>
                <Icon name="information-circle" size={18} color={Colors.gold} />
              </View>
              <SentriText variant="body" color={Colors.text} style={styles.menuLabel}>
                Help & 24/7 Customer Support
              </SentriText>
            </View>
            <Icon name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </TacticalCard>

        {/* 5. Log Out Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Icon name="log-out" size={18} color={Colors.danger} />
            <SentriText variant="mono" color={Colors.danger} style={styles.logoutText}>
              LOG OUT
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
    backgroundColor: Colors.badgeBg,
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
  userEmail: {
    fontSize: 13,
  },
  creditsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  creditsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  creditsCount: {
    fontSize: 12,
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
