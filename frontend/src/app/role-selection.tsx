import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriButton } from '@/components/ui/SentriButton';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { TacticalCard } from '@/components/ui/TacticalCard';
import { Icon } from '@/components/ui/Icon';
import { useAuth, UserRole } from '@/context/AuthContext';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { setRole } = useAuth();
  const [selectedRole, setSelectedRoleState] = useState<UserRole>('client');

  const handleSelect = (role: UserRole) => {
    setSelectedRoleState(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      setRole(selectedRole);
      router.push(`/register?role=${selectedRole}` as any);
    }
  };

  const isClientSelected = selectedRole === 'client';
  const isProSelected = selectedRole === 'professional';

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI"/>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <SentriText variant="h1" align="center" style={styles.mainHeading}>
            Select Role
          </SentriText>
        </View>

        {/* Client Selection Card */}
        <TacticalCard
          interactive
          onPress={() => handleSelect('client')}
          backgroundColor={isClientSelected ? Colors.surfaceElevated : Colors.surface}
          borderColor={isClientSelected ? Colors.gold : Colors.border}
          accentColor={isClientSelected ? Colors.gold : Colors.borderLight}
          style={styles.cardMargin}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, isClientSelected && styles.activeIconBox]}>
              <Icon name="briefcase" size={22} color={isClientSelected ? Colors.gold : Colors.text} />
            </View>
            <View style={styles.cardTitleBox}>
              <SentriText variant="h3" color={Colors.text} style={styles.roleTitle}>
                I need to hire security
              </SentriText>
            </View>
            <View style={[styles.checkBadge, isClientSelected ? styles.checkBadgeActive : styles.checkBadgeInactive]}>
              {isClientSelected ? (
                <Icon name="checkmark" size={14} color={Colors.background} />
              ) : (
                <View style={styles.emptyDot} />
              )}
            </View>
          </View>
          <SentriText variant="body" color={Colors.textSecondary} style={styles.cardBody}>
            Request verified security teams for events or personal protection.
          </SentriText>
        </TacticalCard>

        {/* Security Professional Card */}
        <TacticalCard
          interactive
          onPress={() => handleSelect('professional')}
          backgroundColor={isProSelected ? Colors.surfaceElevated : Colors.surface}
          borderColor={isProSelected ? Colors.gold : Colors.border}
          accentColor={isProSelected ? Colors.gold : Colors.borderLight}
          style={styles.cardMargin}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, isProSelected && styles.activeIconBox]}>
              <Icon name="shield-checkmark" size={22} color={isProSelected ? Colors.gold : Colors.text} />
            </View>
            <View style={styles.cardTitleBox}>
              <SentriText variant="h3" color={Colors.text} style={styles.roleTitle}>
                I am a security professional
              </SentriText>
            </View>
            <View style={[styles.checkBadge, isProSelected ? styles.checkBadgeActive : styles.checkBadgeInactive]}>
              {isProSelected ? (
                <Icon name="checkmark" size={14} color={Colors.background} />
              ) : (
                <View style={styles.emptyDot} />
              )}
            </View>
          </View>
          <SentriText variant="body" color={Colors.textSecondary} style={styles.cardBody}>
            Accept dispatch requests, manage shifts, and build your trust score.
          </SentriText>
        </TacticalCard>

        {/* Compact Continue Button */}
        <View style={styles.actionSection}>
          <SentriButton
            title="Proceed →"
            variant="primary"
            size="md"
            onPress={handleContinue}
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
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  headerSection: {
    marginVertical: Spacing.md,
    alignItems: 'center',
  },
  mainHeading: {
    fontSize: 24,
    letterSpacing: 1,
  },
  cardMargin: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginRight: Spacing.sm,
  },
  activeIconBox: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(240, 167, 59, 0.15)',
  },
  cardTitleBox: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadgeActive: {
    backgroundColor: Colors.gold,
  },
  checkBadgeInactive: {
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    backgroundColor: 'transparent',
  },
  emptyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textMuted,
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },
  actionSection: {
    marginTop: Spacing.md,
    alignItems: 'center',
    marginTop: 'auto',
  },
});
