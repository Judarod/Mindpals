import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { COLORS, BORDER_RADIUS, SPACING, FONTS, SHADOWS } from '../constants/theme';

interface SpeechBubbleProps {
  message: string;
  variant?: 'default' | 'thinking' | 'excited';
}

export function SpeechBubble({ message, variant = 'default' }: SpeechBubbleProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (variant === 'excited') {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 300 }),
          withTiming(1, { duration: 300 })
        ),
        3,
        false
      );
    }
  }, [variant, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.bubble}>
        <Text style={styles.text}>{message}</Text>
      </View>
      <View style={styles.tail} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  bubble: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    maxWidth: 250,
    ...SHADOWS.soft,
  },
  text: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.white,
    marginTop: -1,
  },
});
