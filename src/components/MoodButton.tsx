import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MoodType, MOOD_CONFIG } from '../constants/types';
import { COLORS, BORDER_RADIUS, SPACING, FONTS, SHADOWS } from '../constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface MoodButtonProps {
  mood: MoodType;
  onPress: (mood: MoodType) => void;
  isSelected?: boolean;
  disabled?: boolean;
}

export function MoodButton({ mood, onPress, isSelected = false, disabled = false }: MoodButtonProps) {
  const scale = useSharedValue(1);
  const config = MOOD_CONFIG[mood];

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = async () => {
    if (disabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(mood);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getBackgroundColor = () => {
    switch (mood) {
      case 'sunny':
        return '#FFE89A';
      case 'cloudy':
        return '#C8E4F4';
      case 'stormy':
        return '#8B98B8';
      case 'drizzly':
        return '#B0D8E8';
      default:
        return COLORS.card;
    }
  };

  const getIconBackgroundColor = () => {
    switch (mood) {
      case 'sunny':
        return '#FFD54F';
      case 'cloudy':
        return '#B0D4E8';
      case 'stormy':
        return '#6B7898';
      case 'drizzly':
        return '#90C8D8';
      default:
        return COLORS.overlay;
    }
  };

  return (
    <AnimatedTouchable
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor() },
        isSelected && styles.selected,
        disabled && styles.disabled,
        animatedStyle,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor() }]}>
        <Text style={styles.emoji}>{config.emoji}</Text>
      </View>
      <Text style={[styles.label, mood === 'stormy' && styles.lightLabel]}>
        {config.label}
      </Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
  selected: {
    borderWidth: 3,
    borderColor: COLORS.accent,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  emoji: {
    fontSize: 24,
  },
  label: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  lightLabel: {
    color: COLORS.white,
  },
});
