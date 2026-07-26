import React from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.dockContainer}>
        <View style={styles.dockCapsule}>
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
                  color={isActive ? Colors.gold : Colors.textMuted}
                />
                <SentriText
                  variant="monoSmall"
                  style={[
                    styles.tabLabel,
                    { color: isActive ? Colors.gold : Colors.textMuted },
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
  },
  dockContainer: {
    width: '92%',
    maxWidth: 420,
  },
  dockCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#171C25',
    borderColor: '#30353E',
    borderWidth: 1.5,
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  activeTabBtn: {
    backgroundColor: 'rgba(240, 167, 59, 0.12)',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
