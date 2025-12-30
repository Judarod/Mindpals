import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { getTimeBasedBackground } from '../utils/helpers';
import { MoodType } from '../constants/types';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface DynamicBackgroundProps {
  mood?: MoodType | null;
  children: React.ReactNode;
  variant?: 'home' | 'zen' | 'shop';
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export function DynamicBackground({ mood, children, variant = 'home' }: DynamicBackgroundProps) {
  const [colors, setColors] = useState<string[]>(getTimeBasedBackground());

  // Update colors periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setColors(getTimeBasedBackground());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Override colors based on mood or variant
  const getBackgroundColors = (): [string, string, string] => {
    if (variant === 'zen') {
      return ['#B8E4F0', '#E0F4FF', '#B8E4F0'];
    }
    if (variant === 'shop') {
      return ['#E8D4F0', '#F0E4F8', '#DBC4E8'];
    }
    if (mood) {
      switch (mood) {
        case 'sunny':
          return ['#FFF5E6', '#FFE4CC', '#FFD6AA'];
        case 'cloudy':
          return ['#D4E8F0', '#E8F4FC', '#C8DCE8'];
        case 'stormy':
          return ['#D4D0E8', '#E0DCF0', '#C8C4DC'];
        case 'drizzly':
          return ['#D8EEF4', '#E8F8FC', '#CCE4EC'];
        default:
          return colors as [string, string, string];
      }
    }
    return colors as [string, string, string];
  };

  return (
    <LinearGradient
      colors={getBackgroundColors() as [string, string, ...string[]]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SparkleOverlay />
      {children}
    </LinearGradient>
  );
}

function SparkleOverlay() {
  const sparkles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: Math.random() * width,
    top: Math.random() * height * 0.7,
    delay: Math.random() * 2000,
  }));

  return (
    <View style={styles.sparkleContainer} pointerEvents="none">
      {sparkles.map(sparkle => (
        <Sparkle
          key={sparkle.id}
          left={sparkle.left}
          top={sparkle.top}
          delay={sparkle.delay}
        />
      ))}
    </View>
  );
}

function Sparkle({ left, top, delay }: { left: number; top: number; delay: number }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    const startAnimation = () => {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(0.6, { duration: 1500 }),
          withTiming(0, { duration: 1500 })
        ),
        -1,
        false
      );
      scale.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 0 }),
          withTiming(1, { duration: 1500 }),
          withTiming(0.5, { duration: 1500 })
        ),
        -1,
        false
      );
    };

    const timeout = setTimeout(startAnimation, delay);
    return () => clearTimeout(timeout);
  }, [delay, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.sparkle,
        { left, top },
        animatedStyle,
      ]}
    >
      <View style={styles.sparkleInner} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sparkleContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  sparkle: {
    position: 'absolute',
    width: 8,
    height: 8,
  },
  sparkleInner: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.white,
    borderRadius: 4,
  },
});
