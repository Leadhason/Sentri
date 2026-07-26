import React from 'react';
import { Text as RNText, TextStyle, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { Theme, Colors, Fonts } from '@/constants/theme';

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'title'
  | 'body'
  | 'bodyBold'
  | 'caption'
  | 'mono'
  | 'monoSmall';

interface SentriTextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: TextStyle | TextStyle[];
  children: React.ReactNode;
}

export const SentriText: React.FC<SentriTextProps> = ({
  variant = 'body',
  color = Colors.text,
  align = 'left',
  style,
  children,
  ...props
}) => {
  const getStyleForVariant = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return {
          fontFamily: Fonts.titleBold,
          fontSize: 28,
          lineHeight: 34,
          letterSpacing: -0.5,
        };
      case 'h2':
        return {
          fontFamily: Fonts.titleBold,
          fontSize: 22,
          lineHeight: 28,
          letterSpacing: -0.3,
        };
      case 'h3':
        return {
          fontFamily: Fonts.titleSemiBold,
          fontSize: 18,
          lineHeight: 24,
        };
      case 'title':
        return {
          fontFamily: Fonts.titleBold,
          fontSize: 20,
          lineHeight: 26,
          letterSpacing: 2,
          textTransform: 'uppercase',
        };
      case 'body':
        return {
          fontFamily: Fonts.bodyRegular,
          fontSize: 15,
          lineHeight: 22,
        };
      case 'bodyBold':
        return {
          fontFamily: Fonts.bodyBold,
          fontSize: 15,
          lineHeight: 22,
        };
      case 'caption':
        return {
          fontFamily: Fonts.bodyRegular,
          fontSize: 13,
          lineHeight: 18,
        };
      case 'mono':
        return {
          fontFamily: Fonts.monoSemiBold,
          fontSize: 13,
          lineHeight: 18,
          letterSpacing: 1,
        };
      case 'monoSmall':
        return {
          fontFamily: Fonts.monoRegular,
          fontSize: 11,
          lineHeight: 16,
          letterSpacing: 0.5,
        };
      default:
        return {
          fontFamily: Fonts.bodyRegular,
          fontSize: 15,
          lineHeight: 22,
        };
    }
  };

  return (
    <RNText
      style={[
        getStyleForVariant(),
        { color, textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};
