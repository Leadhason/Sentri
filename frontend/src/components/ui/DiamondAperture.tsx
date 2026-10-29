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
  color = Colors.primary,
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
            toValue: -5,
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
      {/* Outer Rounded Diamond Ring */}
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

      {/* Inner Cutout */}
      <View
        style={[
          styles.innerDiamond,
          {
            width: innerSize * 0.76,
            height: innerSize * 0.76,
            borderColor: filled ? Colors.background : 'rgba(22, 163, 74, 0.4)',
            backgroundColor: filled ? Colors.background : 'transparent',
            transform: [{ rotate: '45deg' }],
          },
        ]}
      >
        {/* Core Center Rounded Diamond */}
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
            style={[styles.scoreText, { color: filled ? Colors.primaryDark : color, fontSize: size * 0.28 }]}
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
    borderWidth: 1.5,
    borderRadius: 8, // Rounded aperture corners
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  innerDiamond: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSolidDiamond: {
    borderRadius: 4,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scoreText: {
    fontWeight: '800',
    letterSpacing: -1,
  },
  statusLabel: {
    marginTop: 2,
    textTransform: 'uppercase',
  },
});
