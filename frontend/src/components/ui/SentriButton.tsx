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
import { Colors, Spacing, Fonts, Radius } from '@/constants/theme';
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
      borderRadius: Radius.md, // Rounded 14px
      paddingHorizontal: Spacing.md,
    };

    // Size
    switch (size) {
      case 'sm':
        base.height = 40;
        base.paddingHorizontal = Spacing.sm;
        base.borderRadius = Radius.sm;
        break;
      case 'md':
        base.height = 50;
        base.paddingHorizontal = Spacing.md;
        base.borderRadius = Radius.md;
        break;
      case 'lg':
        base.height = 56;
        base.paddingHorizontal = Spacing.lg;
        base.borderRadius = Radius.lg;
        break;
    }

    // Variant
    switch (variant) {
      case 'primary':
        base.backgroundColor = disabled ? '#CBD5E1' : Colors.primary;
        if (!disabled) {
          base.shadowColor = Colors.primary;
          base.shadowOffset = { width: 0, height: 3 };
          base.shadowOpacity = 0.22;
          base.shadowRadius = 8;
          base.elevation = 3;
        }
        break;
      case 'secondary':
        base.backgroundColor = Colors.surfaceSolid;
        base.borderWidth = 1;
        base.borderColor = Colors.border;
        base.shadowColor = '#64748B';
        base.shadowOffset = { width: 0, height: 1 };
        base.shadowOpacity = 0.05;
        base.shadowRadius = 4;
        base.elevation = 1;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1.5;
        base.borderColor = Colors.primary;
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
    if (disabled) return '#94A3B8';
    switch (variant) {
      case 'primary':
        return '#FFFFFF'; // Clean white on green
      case 'secondary':
        return Colors.text;
      case 'outline':
        return Colors.primaryDark;
      case 'danger':
        return '#FFFFFF';
      case 'ghost':
        return Colors.primaryDark;
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
                letterSpacing: 1,
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
