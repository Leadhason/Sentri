import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, TouchableOpacityProps, Platform } from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';

interface TacticalCardProps extends TouchableOpacityProps {
  accentColor?: string;
  borderColor?: string;
  backgroundColor?: string;
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
  onPress?: () => void;
  interactive?: boolean;
}

export const TacticalCard: React.FC<TacticalCardProps> = ({
  accentColor,
  borderColor = Colors.border,
  backgroundColor = Colors.surface,
  style,
  children,
  onPress,
  interactive = false,
  ...props
}) => {
  const isWeb = Platform.OS === 'web';

  const cardStyle: ViewStyle = {
    backgroundColor,
    borderColor,
    ...(accentColor ? { borderLeftWidth: 4, borderLeftColor: accentColor } : {}),
    ...(isWeb ? ({ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' } as any) : {}),
  };

  const content = (
    <View
      style={[
        styles.card,
        cardStyle,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress || interactive) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} {...props}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg, // Rounded 18px
    borderWidth: 1,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    overflow: 'hidden',
    ...Shadows.card,
  },
});
