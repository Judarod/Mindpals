import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ShopItem as ShopItemType } from '../constants/types';
import { COLORS, BORDER_RADIUS, SPACING, FONTS, SHADOWS } from '../constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ShopItemProps {
  item: ShopItemType;
  isOwned: boolean;
  isEquipped: boolean;
  canAfford: boolean;
  onBuy: () => void;
  onEquip: () => void;
}

export function ShopItemCard({
  item,
  isOwned,
  isEquipped,
  canAfford,
  onBuy,
  onEquip,
}: ShopItemProps) {
  const scale = useSharedValue(1);

  const handlePress = async () => {
    if (isOwned) {
      // Toggle equip
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      scale.value = withSequence(
        withSpring(0.95),
        withSpring(1)
      );
      onEquip();
    } else if (canAfford) {
      // Buy item
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      scale.value = withSequence(
        withSpring(1.05),
        withSpring(1)
      );
      onBuy();
    } else {
      // Can't afford
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      scale.value = withSequence(
        withSpring(0.98),
        withSpring(1.02),
        withSpring(1)
      );
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getStatusText = () => {
    if (isEquipped) return 'EQUIPPED';
    if (isOwned) return 'EQUIP';
    return 'BUY';
  };

  const getStatusColor = () => {
    if (isEquipped) return COLORS.accent;
    if (isOwned) return '#8FBC8F';
    if (canAfford) return COLORS.primary;
    return COLORS.textLight;
  };

  return (
    <AnimatedTouchable
      style={[
        styles.container,
        !canAfford && !isOwned && styles.locked,
        animatedStyle,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>

      <Text style={styles.name}>{item.name}</Text>

      {!isOwned && (
        <Text style={styles.price}>({item.price}-Bits)</Text>
      )}

      {isEquipped && (
        <View style={styles.equippedBadge}>
          <Text style={styles.equippedText}>EQUIPPED</Text>
        </View>
      )}

      {!isEquipped && (
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: getStatusColor() },
            !canAfford && !isOwned && styles.disabledButton,
          ]}
          onPress={handlePress}
          disabled={!canAfford && !isOwned}
        >
          <Text style={styles.actionText}>{getStatusText()}</Text>
        </TouchableOpacity>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    flex: 1,
    margin: SPACING.xs,
    minHeight: 150,
    ...SHADOWS.soft,
  },
  locked: {
    opacity: 0.7,
  },
  emojiContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  emoji: {
    fontSize: 32,
  },
  name: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  price: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  equippedBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.xs,
  },
  equippedText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: '#B8860B',
    letterSpacing: 0.5,
  },
  actionButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.xs,
  },
  disabledButton: {
    backgroundColor: COLORS.textLight,
  },
  actionText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
});
