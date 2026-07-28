import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { Icon } from '@/components/ui/Icon';

export default function InAppCallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const callerName = (params.name as string) || 'Sentri Command & Dispatch';

  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Radar Pulse Animation
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Call timer interval
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Brand Header */}
      <View style={styles.header}>
        <SentriText variant="h1" align="center" style={styles.brandTitle}>
          SENTRI
        </SentriText>
      </View>

      {/* Main Avatar & Radar Pulse */}
      <View style={styles.mainCanvas}>
        <View style={styles.avatarAssembly}>
          <Animated.View
            style={[
              styles.radarRing,
              { transform: [{ scale: pulseAnim }], opacity: 0.4 },
            ]}
          />
          <View style={styles.avatarInner}>
            <Icon name="shield-checkmark" size={48} color={Colors.gold} />
          </View>
          <View style={styles.lockBadge}>
            <Icon name="lock" size={12} color={Colors.gold} />
          </View>
        </View>

        {/* Call Info & Live Timer */}
        <View style={styles.infoBox}>
          <SentriText variant="h2" align="center" style={styles.callerTitle}>
            {callerName}
          </SentriText>

          <View style={styles.timerPill}>
            <View style={styles.liveDot} />
            <SentriText variant="mono" color={Colors.gold} style={styles.timerText}>
              {formatTimer(secondsElapsed)}
            </SentriText>
          </View>
        </View>
      </View>

      {/* Call Controls Dock */}
      <View style={styles.controlDock}>
        {/* Mute Button */}
        <TouchableOpacity
          style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
          onPress={() => setIsMuted(!isMuted)}
          activeOpacity={0.8}
        >
          <Icon name={isMuted ? 'mic-off' : 'mic'} size={24} color={isMuted ? Colors.background : Colors.text} />
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.btnLabel}>
            {isMuted ? 'MUTED' : 'MUTE'}
          </SentriText>
        </TouchableOpacity>

        {/* End Call Button */}
        <TouchableOpacity
          style={styles.endCallBtn}
          onPress={handleEndCall}
          activeOpacity={0.8}
        >
          <Icon name="call-end" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Speaker Button */}
        <TouchableOpacity
          style={[styles.controlBtn, isSpeaker && styles.controlBtnActive]}
          onPress={() => setIsSpeaker(!isSpeaker)}
          activeOpacity={0.8}
        >
          <Icon name={isSpeaker ? 'volume-high' : 'volume-medium'} size={24} color={isSpeaker ? Colors.background : Colors.text} />
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.btnLabel}>
            {isSpeaker ? 'SPEAKER' : 'AUDIO'}
          </SentriText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: Spacing.lg,
  },
  brandTitle: {
    fontSize: 28,
    letterSpacing: -1,
  },
  mainCanvas: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  avatarAssembly: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  radarRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  avatarInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    alignItems: 'center',
    gap: 12,
  },
  callerTitle: {
    fontSize: 22,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gold,
  },
  timerText: {
    fontSize: 14,
  },
  controlDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  controlBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  controlBtnActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  btnLabel: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
  endCallBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
});
