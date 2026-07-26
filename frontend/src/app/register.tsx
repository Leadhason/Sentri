import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriButton } from '@/components/ui/SentriButton';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { Icon } from '@/components/ui/Icon';
import { useAuth, UserRole } from '@/context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { register } = useAuth();

  const [activeRole, setActiveRole] = useState<UserRole>(
    (params.role as UserRole) || 'client'
  );

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!agreed) {
      setErrorMsg('You must agree to the Terms of Operational Service.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      await register(fullName, email, activeRole);
      setLoading(false);

      if (activeRole === 'professional') {
        router.replace('/pro-setup' as any);
      } else {
        router.replace('/(client)/home' as any);
      }
    } catch (e: any) {
      setLoading(false);
      setErrorMsg('Failed to register account. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" />

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Heading */}
        <View style={styles.headingSection}>
          <SentriText variant="h1">Create Account</SentriText>
          <SentriText variant="body" color={Colors.textSecondary}>
            {activeRole === 'client'
              ? 'Register as a client to request guards and run AI threat assessments.'
              : 'Register as a security specialist to accept dispatches and earn payouts.'}
          </SentriText>
        </View>

        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Icon name="alert-circle" size={16} color={Colors.textDanger} />
            <SentriText variant="caption" color={Colors.textDanger} style={styles.errorText}>
              {errorMsg}
            </SentriText>
          </View>
        ) : null}

        {/* Form Inputs */}
        <View style={styles.formGroup}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.label}>
            FULL NAME *
          </SentriText>
          <View style={styles.inputContainer}>
            <Icon name="person" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Kwame Mensah"
              placeholderTextColor={Colors.textMuted}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.label}>
            EMAIL ADDRESS *
          </SentriText>
          <View style={styles.inputContainer}>
            <Icon name="user" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="operator@sentri.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.label}>
            PHONE NUMBER (GHANA +233)
          </SentriText>
          <View style={styles.inputContainer}>
            <Icon name="phone" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="+233 24 000 0000"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.label}>
            PASSWORD *
          </SentriText>
          <View style={styles.inputContainer}>
            <Icon name="lock-closed" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.label}>
            CONFIRM PASSWORD *
          </SentriText>
          <View style={styles.inputContainer}>
            <Icon name="lock-closed" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
        </View>

        {/* Checkbox */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAgreed(!agreed)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
            {agreed && <Icon name="checkmark" size={12} color={Colors.background} />}
          </View>
          <SentriText variant="caption" color={Colors.textSecondary} style={styles.checkboxLabel}>
            I agree to the <SentriText variant="caption" color={Colors.gold}>Terms of Operational Service</SentriText> and Paystack Escrow protocol.
          </SentriText>
        </TouchableOpacity>

        {/* Submit */}
        <SentriButton
          title={activeRole === 'professional' ? 'Next: Setup Profile →' : 'Create Account →'}
          variant="primary"
          size="lg"
          loading={loading}
          onPress={handleRegister}
          style={styles.submitBtn}
        />

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.push('/login' as any)}
          activeOpacity={0.7}
        >
          <SentriText variant="mono" color={Colors.textSecondary} style={styles.loginText}>
            ALREADY REGISTERED? <SentriText variant="mono" color={Colors.gold}>LOGIN</SentriText>
          </SentriText>
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
  },
  roleSegment: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
    marginBottom: Spacing.md,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 6,
  },
  activeSegmentBtn: {
    backgroundColor: 'rgba(240, 167, 59, 0.15)',
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '700',
  },
  headingSection: {
    marginBottom: Spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dangerMuted,
    borderWidth: 1,
    borderColor: Colors.danger,
    padding: Spacing.sm,
    borderRadius: 6,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: 12,
  },
  formGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    height: 48,
    gap: 10,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 15,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: Spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
  },
  submitBtn: {
    marginTop: Spacing.md,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  loginText: {
    fontSize: 12,
    letterSpacing: 1,
  },
});
