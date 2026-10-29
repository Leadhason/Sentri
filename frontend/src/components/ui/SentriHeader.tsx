import React from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Shadows } from '@/constants/theme';
import { SentriText } from './SentriText';
import { Icon, IconName } from './Icon';

interface SentriHeaderProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightIcon?: IconName;
  onRightPress?: () => void;
}

export const SentriHeader: React.FC<SentriHeaderProps> = ({
  title = 'SENTRI',
  showBack = false,
  onBackPress,
  rightIcon = 'notifications',
  onRightPress,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBar}>
        {showBack ? (
          <TouchableOpacity style={styles.iconBtn} onPress={handleBack} activeOpacity={0.7}>
            <Icon name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtnPlaceholder} />
        )}

        <View style={styles.titleContainer}>
          <SentriText variant="title" style={styles.brandTitle}>
            {title}
          </SentriText>
        </View>

        {rightIcon ? (
          <TouchableOpacity style={styles.iconBtn} onPress={onRightPress} activeOpacity={0.7}>
            <Icon name={rightIcon} size={20} color={Colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtnPlaceholder} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.background,
  },
  headerBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSolid,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  iconBtnPlaceholder: {
    width: 40,
    height: 40,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: Colors.text,
    letterSpacing: 2,
    fontWeight: '800',
  },
});
