import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, BORDER_RADIUS, SPACING, FONTS, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { getCurrentTime, calculateBatteryLevel } from '../utils/helpers';

interface HeaderProps {
  showBattery?: boolean;
}

export function Header({ showBattery = true }: HeaderProps) {
  const { state } = useApp();
  const insets = useSafeAreaInsets();
  const currentTime = getCurrentTime();

  const batteryLevel = calculateBatteryLevel(
    state.hasCheckedInToday,
    state.totalMeditationMinutes > 0
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.sm }]}>
      <View style={styles.topRow}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeIcon}>☀️</Text>
          <Text style={styles.timeText}>{currentTime}</Text>
        </View>

        {showBattery && (
          <View style={styles.batteryContainer}>
            <View style={styles.batteryOuter}>
              <View
                style={[
                  styles.batteryInner,
                  { width: `${batteryLevel}%` },
                ]}
              />
            </View>
            <Text style={styles.batteryText}>{batteryLevel}%</Text>
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBadge}>
          <Text style={styles.statEmoji}>🏆</Text>
          <Text style={styles.statText}>Zen Level</Text>
        </View>

        <View style={styles.statBadge}>
          <Text style={styles.statEmoji}>⭐</Text>
          <Text style={styles.statText}>Sun-Bits: {state.sunBits}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.soft,
  },
  timeIcon: {
    fontSize: 12,
    marginRight: SPACING.xs,
  },
  timeText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.soft,
  },
  batteryOuter: {
    width: 30,
    height: 12,
    backgroundColor: COLORS.overlay,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: SPACING.xs,
  },
  batteryInner: {
    height: '100%',
    backgroundColor: '#8FBC8F',
    borderRadius: 6,
  },
  batteryText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.soft,
  },
  statEmoji: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  statText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
});
