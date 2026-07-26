import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

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
  const content = (
    <View
      style={[
        styles.card,
        { backgroundColor, borderColor },
        accentColor ? { borderLeftWidth: 4, borderLeftColor: accentColor } : null,
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
    borderRadius: 8,
    borderWidth: 1,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    overflow: 'hidden',
  },
});
