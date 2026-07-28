import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { TacticalCard } from '@/components/ui/TacticalCard';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/context/AuthContext';

export default function ClientAccountScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/splash' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack={false} rightIcon="notifications" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <TacticalCard backgroundColor={Colors.surface} style={styles.userCard}>
          <View style={styles.userRow}>
            <View style={styles.avatarBox}>
              <Icon name="user" size={24} color={Colors.gold} />
            </View>
            <View style={styles.userInfo}>
              <SentriText variant="h2" style={styles.userName}>
                {user?.fullName || 'Client Operator'}
              </SentriText>
              <SentriText variant="monoSmall" color={Colors.textSecondary}>
                {user?.email || 'client@sentri.com'}
              </SentriText>
            </View>
          </View>
        </TacticalCard>

        {/* Options List */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
            <View style={styles.menuLeft}>
              <Icon name="wallet" size={18} color={Colors.gold} />
              <SentriText variant="body" color={Colors.text}>Paystack Escrow History</SentriText>
            </View>
            <Icon name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
            <View style={styles.menuLeft}>
              <Icon name="notifications" size={18} color={Colors.gold} />
              <SentriText variant="body" color={Colors.text}>Emergency Notification Alerts</SentriText>
            </View>
            <Icon name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Icon name="log-out" size={18} color={Colors.danger} />
          <SentriText variant="mono" color={Colors.danger}>LOGOUT OPERATOR SESSION</SentriText>
        </TouchableOpacity>
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
  userCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(240, 167, 59, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
  },
  menuSection: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginBottom: Spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.dangerMuted,
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: 8,
    paddingVertical: 14,
  },
});
