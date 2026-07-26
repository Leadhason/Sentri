export const Theme = {
  colors: {
    // Dark Tactical Palette
    background: '#0E141C',
    surface: '#171C25',
    surfaceElevated: '#1E2430',
    surfaceHighlighted: '#252C3A',
    
    // Borders
    border: '#30353E',
    borderLight: '#454C59',
    borderActive: '#F0A73B',

    // Primary Accents
    gold: '#F0A73B',
    goldHover: '#D9922B',
    goldMuted: 'rgba(240, 167, 59, 0.15)',
    goldBorder: 'rgba(240, 167, 59, 0.4)',

    // Status Colors
    success: '#2E7D32',
    successLight: '#4CAF50',
    successMuted: 'rgba(46, 125, 50, 0.15)',
    
    warning: '#ED6C02',
    warningLight: '#FF9800',
    warningMuted: 'rgba(237, 108, 2, 0.15)',
    
    danger: '#D32F2F',
    dangerLight: '#F44336',
    dangerMuted: 'rgba(211, 47, 47, 0.15)',
    
    info: '#0288D1',
    infoLight: '#29B6F6',
    infoMuted: 'rgba(2, 136, 209, 0.15)',

    // Typography
    text: '#F0F4F8',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textGold: '#F0A73B',
    textDanger: '#F44336',
    textSuccess: '#4CAF50',
  },

  fonts: {
    titleBold: 'SpaceGrotesk_700Bold',
    titleSemiBold: 'SpaceGrotesk_600SemiBold',
    titleMedium: 'SpaceGrotesk_500Medium',
    bodyRegular: 'IBMPlexSans_400Regular',
    bodyMedium: 'IBMPlexSans_500Medium',
    bodyBold: 'IBMPlexSans_700Bold',
    monoRegular: 'IBMPlexMono_400Regular',
    monoSemiBold: 'IBMPlexMono_600SemiBold',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  radius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },

  shadows: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    goldGlow: {
      shadowColor: '#F0A73B',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 6,
    },
  },
};

export const Spacing = Theme.spacing;
export const Colors = Theme.colors;
export const Fonts = Theme.fonts;
