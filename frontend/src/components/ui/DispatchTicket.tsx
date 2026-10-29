import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';
import { SentriText } from './SentriText';
import { Icon } from './Icon';

interface DispatchTicketProps {
  title: string;
  subtitle?: string;
  location?: string;
  timeRange?: string;
  statusTag?: string;
  statusColor?: string;
  priceTag?: string;
  onPress?: () => void;
}

export const DispatchTicket: React.FC<DispatchTicketProps> = ({
  title,
  subtitle,
  location,
  timeRange,
  statusTag,
  statusColor = Colors.primary,
  priceTag,
  onPress,
}) => {
  const isWeb = Platform.OS === 'web';

  return (
    <TouchableOpacity
      style={[
        styles.ticketContainer,
        { borderLeftColor: statusColor },
        isWeb ? ({ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' } as any) : {},
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.contentRow}>
        <View style={styles.mainInfo}>
          <View style={styles.titleRow}>
            <SentriText variant="h3" style={styles.titleText}>
              {title}
            </SentriText>
            {statusTag && (
              <View style={styles.pill}>
                <SentriText variant="monoSmall" style={styles.pillText}>
                  {statusTag}
                </SentriText>
              </View>
            )}
          </View>

          {subtitle && (
            <SentriText variant="body" color={Colors.textSecondary} style={styles.subtitleText}>
              {subtitle}
            </SentriText>
          )}

          <View style={styles.metaRow}>
            {location && (
              <View style={styles.metaItem}>
                <Icon name="location" size={14} color={Colors.textMuted} />
                <SentriText variant="caption" color={Colors.textSecondary} style={styles.metaText}>
                  {location}
                </SentriText>
              </View>
            )}

            {timeRange && (
              <View style={styles.metaItem}>
                <Icon name="time" size={14} color={Colors.textMuted} />
                <SentriText variant="caption" color={Colors.textSecondary} style={styles.metaText}>
                  {timeRange}
                </SentriText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.rightAction}>
          {priceTag ? (
            <SentriText variant="mono" color={Colors.primaryDark} style={styles.priceText}>
              {priceTag}
            </SentriText>
          ) : (
            <Icon name="chevron-forward" size={20} color={Colors.textMuted} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  ticketContainer: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    borderRadius: Radius.lg, // Rounded 18px
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    ...Shadows.card,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainInfo: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 16,
    flex: 1,
    fontWeight: '700',
    color: Colors.text,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999, // Green Pill Badge
    backgroundColor: Colors.badgeBg,
    borderWidth: 1,
    borderColor: Colors.badgeBorder,
    marginLeft: Spacing.xs,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.badgeText,
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 13,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  rightAction: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
