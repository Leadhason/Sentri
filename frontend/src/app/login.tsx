import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriButton } from '@/components/ui/SentriButton';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { Icon } from '@/components/ui/Icon';
import { useAuth, UserRole } from '@/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter both email/phone and password.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      await login(email, password, selectedRole);
      setLoading(false);

      if (selectedRole === 'professional') {
        router.replace('/(pro)/home' as any);
      } else {
        router.replace('/(client)/home' as any);
      }
    } catch (e) {
      setLoading(false);
      setErrorMsg('Invalid authentication credentials.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header section */}
        <View style={styles.headerSection}>
          <SentriText variant="h1" style={styles.heading}>
            Login
          </SentriText>
          <SentriText variant="body" color={Colors.textSecondary}>
            Enter your credentials to access your Sentri tactical dashboard.
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

        {/* Inputs */}
        <View style={styles.formGroup}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.label}>
            EMAIL OR PHONE NUMBER
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
          <View style={styles.labelRow}>
            <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.label}>
              PASSWORD
            </SentriText>
            <TouchableOpacity activeOpacity={0.7}>
              <SentriText variant="caption" color={Colors.gold}>
                FORGOT?
              </SentriText>
            </TouchableOpacity>
          </View>
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

        {/* Submit */}
        <SentriButton
          title="Authenticate & Enter →"
          variant="primary"
          size="md"
          loading={loading}
          onPress={handleLogin}
          style={styles.submitBtn}
        />

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => router.push('/role-selection' as any)}
          activeOpacity={0.7}
        >
          <SentriText variant="mono" color={Colors.textSecondary} style={styles.registerText}>
            NO OPERATOR ACCOUNT? <SentriText variant="mono" color={Colors.gold}>CREATE ACCOUNT</SentriText>
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
  headerSection: {
    marginBottom: Spacing.md,
  },
  stepTag: {
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 4,
  },
  heading: {
    marginBottom: 4,
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1,
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
  submitBtn: {
    marginTop: Spacing.md,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  registerText: {
    fontSize: 12,
    letterSpacing: 1,
  },
});
