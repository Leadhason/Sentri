export const Theme = {
  colors: {
    // Light Canvas Palette (Layered Elevation Tones — avoids pure #FFFFFF flood)
    background: '#F8FAFC',        // Slate-50 soft canvas
    surface: 'rgba(255, 255, 255, 0.85)', // Glassmorphic translucent card surface
    surfaceSolid: '#FFFFFF',      // Pure elevated surface
    surfaceElevated: '#FFFFFF',   // Elevated card layer
    surfaceHighlighted: '#F1F5F9',// Slate-100 subtle hover/highlight
    surfaceSubtle: '#F8FAFC',
    surfaceTranslucent: 'rgba(255, 255, 255, 0.75)',

    // Borders (Clean, subtle, high-end feel)
    border: 'rgba(226, 232, 240, 0.8)', // Slate-200 with soft opacity
    borderLight: '#F1F5F9',
    borderActive: '#16A34A',     // Green focus/active accent

    // Primary Brand & Accents (Vibrant, authoritative Emerald/Forest Green)
    primary: '#16A34A',          // Green-600
    primaryDark: '#15803D',      // Green-700
    primaryLight: '#22C55E',     // Green-500
    primaryMuted: 'rgba(22, 163, 74, 0.10)',
    primaryBorder: 'rgba(22, 163, 74, 0.25)',

    // Backward-compatible alias for existing "gold" tokens -> maps directly to new green!
    gold: '#16A34A',
    goldHover: '#15803D',
    goldMuted: 'rgba(22, 163, 74, 0.10)',
    goldBorder: 'rgba(22, 163, 74, 0.25)',

    // Dedicated Green Badges (Clean, crisp, high-contrast)
    badgeBg: '#DCFCE7',          // Mint/Green-100
    badgeBorder: '#86EFAC',      // Green-300
    badgeText: '#15803D',        // Green-700 (4.8:1 contrast on #DCFCE7)
    badgeMutedBg: 'rgba(22, 163, 74, 0.08)',

    // Status Colors
    success: '#16A34A',
    successLight: '#22C55E',
    successMuted: 'rgba(22, 163, 74, 0.12)',
    successBg: '#DCFCE7',
    
    warning: '#D97706',          // Amber-600
    warningLight: '#F59E0B',
    warningMuted: 'rgba(217, 119, 6, 0.10)',
    warningBg: '#FEF3C7',
    
    danger: '#DC2626',           // Red-600
    dangerLight: '#EF4444',
    dangerMuted: 'rgba(220, 38, 38, 0.10)',
    dangerBg: '#FEE2E2',
    
    info: '#0284C7',             // Sky-600
    infoLight: '#38BDF8',
    infoMuted: 'rgba(2, 132, 199, 0.10)',
    infoBg: '#E0F2FE',

    // Typography (Guaranteed >= 4.5:1 contrast against light background)
    text: '#0F172A',             // Slate-900 (ultra legible, dark text on white)
    textSecondary: '#475569',    // Slate-600 (5.6:1 contrast ratio)
    textMuted: '#64748B',        // Slate-500 (4.6:1 contrast ratio)
    textGold: '#15803D',         // Green text for high contrast
    textDanger: '#DC2626',
    textSuccess: '#15803D',
    textInverse: '#FFFFFF',
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
    lg: 20, // consistent 16-20px gutters
    xl: 28,
    xxl: 40,
  },

  // More rounded radius
  radius: {
    none: 0,
    sm: 8,
    md: 14,
    lg: 18,
    xl: 24,
    pill: 9999,
    full: 9999,
  },

  // Soft, diffused light shadows (no harsh heavy dark blocks)
  shadows: {
    card: {
      shadowColor: '#64748B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 2,
    },
    dock: {
      shadowColor: '#334155',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 20,
      elevation: 8,
    },
    subtle: {
      shadowColor: '#64748B',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    greenGlow: {
      shadowColor: '#16A34A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.20,
      shadowRadius: 12,
      elevation: 4,
    },
    goldGlow: {
      shadowColor: '#16A34A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.20,
      shadowRadius: 12,
      elevation: 4,
    },
  },
};

export const Spacing = Theme.spacing;
export const Colors = Theme.colors;
export const Fonts = Theme.fonts;
export const Radius = Theme.radius;
export const Shadows = Theme.shadows;
