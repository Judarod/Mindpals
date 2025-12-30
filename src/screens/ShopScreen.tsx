import React from 'react';
import { View, StyleSheet, Text, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { DynamicBackground, Header, PetCharacter, ShopItemCard } from '../components';
import { useApp } from '../context/AppContext';
import { SHOP_ITEMS, ItemId } from '../constants/types';
import { SPACING, COLORS, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');

export function ShopScreen() {
  const { state, purchaseItem, equipItem, unequipItem } = useApp();
  const insets = useSafeAreaInsets();

  const handleBuy = async (itemId: ItemId, price: number) => {
    if (state.sunBits >= price) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      purchaseItem(itemId, price);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const handleEquip = async (itemId: ItemId) => {
    if (state.equippedItems.includes(itemId)) {
      unequipItem(itemId);
    } else {
      equipItem(itemId);
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <DynamicBackground variant="shop">
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <Header />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Character preview */}
          <View style={styles.previewContainer}>
            <PetCharacter
              type={state.selectedPet}
              mood={state.todayMood}
              equippedItems={state.equippedItems}
              size={width * 0.4}
            />
          </View>

          {/* Shop title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Zen Shop</Text>
          </View>

          {/* Items grid */}
          <View style={styles.itemsGrid}>
            {SHOP_ITEMS.map((item) => (
              <View key={item.id} style={styles.itemWrapper}>
                <ShopItemCard
                  item={item}
                  isOwned={state.ownedItems.includes(item.id)}
                  isEquipped={state.equippedItems.includes(item.id)}
                  canAfford={state.sunBits >= item.price}
                  onBuy={() => handleBuy(item.id, item.price)}
                  onEquip={() => handleEquip(item.id)}
                />
              </View>
            ))}
          </View>

          {/* Currency reminder */}
          <View style={styles.currencyReminder}>
            <Text style={styles.reminderText}>
              Earn Sun-Bits by checking in daily and meditating!
            </Text>
          </View>
        </ScrollView>
      </View>
    </DynamicBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  previewContainer: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '700',
    color: COLORS.text,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  itemWrapper: {
    width: (width - SPACING.md * 2 - SPACING.sm) / 2,
  },
  currencyReminder: {
    marginTop: SPACING.xl,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  reminderText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
