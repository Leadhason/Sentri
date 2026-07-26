import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Colors } from '@/constants/theme';
import { SentriText } from './SentriText';

interface DiamondApertureProps {
  size?: number;
  value?: number;
  showValue?: boolean;
  pulsing?: boolean;
  floating?: boolean;
  filled?: boolean;
  color?: string;
  statusText?: string;
}

export const DiamondAperture: React.FC<DiamondApertureProps> = ({
  size = 120,
  value = 100,
  showValue = false,
  pulsing = true,
  floating = true,
  filled = true,
  color = Colors.gold,
  statusText,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let pulseAnimation: Animated.CompositeAnimation | null = null;
    let floatAnimation: Animated.CompositeAnimation | null = null;

    if (pulsing) {
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 2200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
    }

    if (floating) {
      floatAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -5, // Subtle, smooth vertical drift (not bouncy)
            duration: 2600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      floatAnimation.start();
    }

    return () => {
      pulseAnimation?.stop();
      floatAnimation?.stop();
    };
  }, [pulsing, floating]);

  const innerSize = size * 0.7;

  return (
    <Animated.View
      style={[
        styles.container,
        { width: size, height: size },
        { transform: [{ translateY: floatAnim }] },
      ]}
    >
      {/* Outer Sharp Diamond Ring */}
      <Animated.View
        style={[
          styles.diamondRing,
          {
            width: innerSize,
            height: innerSize,
            borderColor: color,
            backgroundColor: filled ? color : 'transparent',
            transform: [{ rotate: '45deg' }, { scale: pulseAnim }],
          },
        ]}
      />

      {/* Inner Thin Sharp Cutout */}
      <View
        style={[
          styles.innerDiamond,
          {
            width: innerSize * 0.76,
            height: innerSize * 0.76,
            borderColor: filled ? '#0E141C' : 'rgba(240, 167, 59, 0.5)',
            backgroundColor: filled ? '#0E141C' : 'transparent',
            transform: [{ rotate: '45deg' }],
          },
        ]}
      >
        {/* Core Center Sharp Diamond */}
        {filled && (
          <View
            style={[
              styles.centerSolidDiamond,
              {
                width: innerSize * 0.32,
                height: innerSize * 0.32,
                backgroundColor: color,
              },
            ]}
          />
        )}
      </View>

      {/* Center Score / Content */}
      <View style={styles.centerContent}>
        {showValue && (
          <SentriText
            variant="h1"
            style={[styles.scoreText, { color: filled ? Colors.gold : color, fontSize: size * 0.28 }]}
          >
            {value}
          </SentriText>
        )}
        {statusText && (
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.statusLabel}>
            {statusText}
          </SentriText>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  diamondRing: {
    position: 'absolute',
    borderWidth: 1.5, // Thinner, razor-sharp edge
    borderRadius: 1, // Sharp corners
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  innerDiamond: {
    position: 'absolute',
    borderWidth: 1, // Thin inner cut
    borderRadius: 1, // Sharp corners
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSolidDiamond: {
    borderRadius: 0, // Sharp square/diamond core
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scoreText: {
    fontWeight: '700',
    letterSpacing: -1,
  },
  statusLabel: {
    marginTop: 2,
    textTransform: 'uppercase',
  },
});
