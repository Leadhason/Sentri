import React from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Colors, Spacing, Shadows } from '@/constants/theme';
import { SentriText } from './SentriText';
import { Icon, IconName } from './Icon';

export interface TabItem {
  key: string;
  label: string;
  icon: IconName;
  route: string;
}

interface SentriDockProps {
  tabs: TabItem[];
}

export const SentriDock: React.FC<SentriDockProps> = ({ tabs }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isWeb = Platform.OS === 'web';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.dockContainer}>
        <View
          style={[
            styles.dockCapsule,
            isWeb ? ({ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' } as any) : {},
          ]}
        >
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.route);
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabBtn, isActive && styles.activeTabBtn]}
                onPress={() => router.push(tab.route as any)}
                activeOpacity={0.7}
              >
                <Icon
                  name={tab.icon}
                  size={20}
                  color={isActive ? Colors.primary : Colors.textMuted}
                />
                <SentriText
                  variant="monoSmall"
                  style={[
                    styles.tabLabel,
                    { color: isActive ? Colors.primaryDark : Colors.textMuted },
                  ]}
                >
                  {tab.label}
                </SentriText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: Spacing.md,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  dockContainer: {
    width: '92%',
    maxWidth: 420,
  },
  dockCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: 'rgba(226, 232, 240, 0.9)',
    borderWidth: 1,
    borderRadius: 36,
    paddingVertical: 8,
    paddingHorizontal: 12,
    ...Shadows.dock,
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 22,
  },
  activeTabBtn: {
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
});
