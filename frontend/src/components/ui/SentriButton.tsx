import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Spacing, Fonts } from '@/constants/theme';
import { SentriText } from './SentriText';
import { Icon, IconName } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface SentriButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  iconLeft?: IconName;
  iconRight?: IconName;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
}

export const SentriButton: React.FC<SentriButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  style,
  textStyle,
  onPress,
  ...props
}) => {
  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      paddingHorizontal: Spacing.md,
    };

    // Size
    switch (size) {
      case 'sm':
        base.height = 38;
        base.paddingHorizontal = Spacing.sm;
        break;
      case 'md':
        base.height = 48;
        base.paddingHorizontal = Spacing.md;
        break;
      case 'lg':
        base.height = 56;
        base.paddingHorizontal = Spacing.lg;
        break;
    }

    // Variant
    switch (variant) {
      case 'primary':
        base.backgroundColor = disabled ? '#5C441E' : Colors.gold;
        break;
      case 'secondary':
        base.backgroundColor = Colors.surfaceElevated;
        base.borderWidth = 1;
        base.borderColor = Colors.border;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1.5;
        base.borderColor = Colors.gold;
        break;
      case 'danger':
        base.backgroundColor = Colors.danger;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        break;
    }

    if (disabled && variant !== 'primary') {
      base.opacity = 0.5;
    }

    return base;
  };

  const getTextColor = (): string => {
    if (disabled && variant === 'primary') return '#8A7352';
    switch (variant) {
      case 'primary':
        return '#0E141C'; // Dark text on gold
      case 'secondary':
        return Colors.text;
      case 'outline':
        return Colors.gold;
      case 'danger':
        return Colors.text;
      case 'ghost':
        return Colors.gold;
      default:
        return Colors.text;
    }
  };

  const textColor = getTextColor();
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 18;

  return (
    <TouchableOpacity
      style={[getContainerStyle(), style]}
      disabled={disabled || loading}
      onPress={onPress}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {iconLeft && (
            <View style={styles.iconLeft}>
              <Icon name={iconLeft} size={iconSize} color={textColor} />
            </View>
          )}
          <SentriText
            variant={size === 'sm' ? 'monoSmall' : 'mono'}
            style={[
              {
                color: textColor,
                fontFamily: Fonts.titleBold,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                fontSize: size === 'sm' ? 12 : size === 'lg' ? 15 : 13,
              },
              textStyle || {},
            ]}
          >
            {title}
          </SentriText>
          {iconRight && (
            <View style={styles.iconRight}>
              <Icon name={iconRight} size={iconSize} color={textColor} />
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
});
