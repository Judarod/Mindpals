import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, BREATHING, SPACING, FONTS, BORDER_RADIUS } from '../constants/theme';
import { formatTime } from '../utils/helpers';
import { PetCharacter } from './PetCharacter';
import { PetType } from '../constants/types';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.65;

interface BreathingCircleProps {
  duration: number; // in seconds
  onComplete: () => void;
  isActive: boolean;
  onStart: () => void;
  petType?: PetType;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'idle';

export function BreathingCircle({
  duration,
  onComplete,
  isActive,
  onStart,
  petType = 'puddle',
}: BreathingCircleProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [phase, setPhase] = useState<BreathPhase>('idle');

  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.3);
  const characterScale = useSharedValue(1);

  const updatePhase = useCallback((newPhase: BreathPhase) => {
    setPhase(newPhase);
    if (newPhase !== 'idle') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  // Breathing cycle
  useEffect(() => {
    if (!isActive) {
      cancelAnimation(ringScale);
      cancelAnimation(ringOpacity);
      cancelAnimation(characterScale);
      ringScale.value = 1;
      ringOpacity.value = 0.3;
      characterScale.value = 1;
      setPhase('idle');
      return;
    }

    const breatheCycle = () => {
      const inhaleDuration = BREATHING.inhale;
      const holdDuration = BREATHING.hold;
      const exhaleDuration = BREATHING.exhale;
      const totalCycle = inhaleDuration + holdDuration + exhaleDuration;

      // Ring expansion animation
      ringScale.value = withRepeat(
        withSequence(
          // Inhale - expand
          withTiming(1.3, {
            duration: inhaleDuration,
            easing: Easing.inOut(Easing.ease),
          }),
          // Hold
          withTiming(1.3, { duration: holdDuration }),
          // Exhale - contract
          withTiming(1, {
            duration: exhaleDuration,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      );

      // Ring opacity animation
      ringOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: inhaleDuration }),
          withTiming(0.6, { duration: holdDuration }),
          withTiming(0.3, { duration: exhaleDuration })
        ),
        -1,
        false
      );

      // Character scale animation (subtle breathing effect)
      characterScale.value = withRepeat(
        withSequence(
          withTiming(1.1, {
            duration: inhaleDuration,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1.1, { duration: holdDuration }),
          withTiming(1, {
            duration: exhaleDuration,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      );
    };

    breatheCycle();

    // Phase text updater
    const phaseInterval = setInterval(() => {
      const elapsed = (duration - timeRemaining) * 1000;
      const cycleTime = BREATHING.inhale + BREATHING.hold + BREATHING.exhale;
      const cyclePosition = elapsed % cycleTime;

      if (cyclePosition < BREATHING.inhale) {
        if (phase !== 'inhale') updatePhase('inhale');
      } else if (cyclePosition < BREATHING.inhale + BREATHING.hold) {
        if (phase !== 'hold') updatePhase('hold');
      } else {
        if (phase !== 'exhale') updatePhase('exhale');
      }
    }, 100);

    return () => {
      clearInterval(phaseInterval);
    };
  }, [isActive, duration, timeRemaining, phase, ringScale, ringOpacity, characterScale, updatePhase]);

  // Timer countdown
  useEffect(() => {
    if (!isActive) {
      setTimeRemaining(duration);
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, duration, onComplete]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const characterAnimatedScale = useAnimatedStyle(() => ({
    transform: [{ scale: characterScale.value }],
  }));

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'INHALE';
      case 'hold':
        return 'HOLD';
      case 'exhale':
        return 'EXHALE';
      default:
        return 'TAP TO START';
    }
  };

  const handlePress = () => {
    if (!isActive) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onStart();
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
      disabled={isActive}
    >
      {/* Timer display */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
      </View>

      {/* Breathing ring */}
      <View style={styles.circleContainer}>
        {/* Outer glow ring */}
        <Animated.View style={[styles.outerRing, ringStyle]} />

        {/* Main ring with arrows */}
        <View style={styles.mainRing}>
          {/* Inhale arrow (top) */}
          <View style={[styles.arrowContainer, styles.arrowTop]}>
            <Text style={styles.arrowText}>→</Text>
            <Text style={styles.phaseLabel}>INHALE</Text>
          </View>

          {/* Exhale arrow (bottom) */}
          <View style={[styles.arrowContainer, styles.arrowBottom]}>
            <Text style={styles.arrowText}>←</Text>
            <Text style={styles.phaseLabel}>EXHALE</Text>
          </View>

          {/* Character in center */}
          <Animated.View style={characterAnimatedScale}>
            <PetCharacter
              type={petType}
              size={CIRCLE_SIZE * 0.45}
              showAccessories={false}
            />
          </Animated.View>
        </View>

        {/* Floating hearts during meditation */}
        {isActive && (
          <View style={styles.heartsContainer}>
            <Text style={styles.heart}>💚</Text>
            <Text style={[styles.heart, styles.heartRight]}>💚</Text>
          </View>
        )}
      </View>

      {/* Phase indicator */}
      {!isActive && (
        <View style={styles.startPrompt}>
          <Text style={styles.startText}>Tap to begin</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContainer: {
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
    position: 'absolute',
    top: SPACING.xl,
    right: SPACING.md,
  },
  timerText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  circleContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 3,
    borderColor: COLORS.white,
    backgroundColor: 'transparent',
  },
  mainRing: {
    width: CIRCLE_SIZE * 0.85,
    height: CIRCLE_SIZE * 0.85,
    borderRadius: (CIRCLE_SIZE * 0.85) / 2,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  arrowContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  arrowTop: {
    top: -5,
  },
  arrowBottom: {
    bottom: -5,
  },
  arrowText: {
    fontSize: 20,
    color: COLORS.white,
  },
  phaseLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: '600',
    letterSpacing: 1,
  },
  heartsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  heart: {
    position: 'absolute',
    fontSize: 16,
    left: '25%',
    top: '30%',
  },
  heartRight: {
    left: 'auto',
    right: '25%',
    top: '60%',
  },
  startPrompt: {
    marginTop: SPACING.xl,
  },
  startText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textLight,
    fontWeight: '500',
  },
});
