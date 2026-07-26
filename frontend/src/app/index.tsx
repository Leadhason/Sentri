import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { DiamondAperture } from '@/components/ui/DiamondAperture';
import { SentriText } from '@/components/ui/SentriText';
import { useAuth } from '@/context/AuthContext';

export default function IndexScreen() {
  const router = useRouter();
  const { user, role, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (!user) {
        router.replace('/splash' as any);
      } else if (role === 'client') {
        router.replace('/(client)/home' as any);
      } else if (role === 'professional') {
        router.replace('/(pro)/home' as any);
      } else {
        router.replace('/splash' as any);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [user, role, isLoading]);

  return (
    <View style={styles.container}>
      <DiamondAperture size={120} pulsing showValue={false} color={Colors.gold} />
      <SentriText variant="mono" color={Colors.gold} style={styles.statusTag}>
        AUTHENTICATING SESSION...
      </SentriText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTag: {
    fontSize: 12,
    letterSpacing: 3,
    marginTop: 32,
    fontWeight: '600',
  },
});
