import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { PetType, MoodType, ItemId } from '../constants/types';
import { COLORS, SPACING } from '../constants/theme';

const { width } = Dimensions.get('window');
const CHARACTER_SIZE = width * 0.55;

interface PetCharacterProps {
  type: PetType;
  mood?: MoodType | null;
  isSleepy?: boolean;
  equippedItems?: ItemId[];
  size?: number;
  showAccessories?: boolean;
  breathingScale?: number;
}

export function PetCharacter({
  type,
  mood,
  isSleepy = false,
  equippedItems = [],
  size = CHARACTER_SIZE,
  showAccessories = true,
  breathingScale = 1,
}: PetCharacterProps) {
  const floatY = useSharedValue(0);
  const wobble = useSharedValue(0);
  const sleepyOpacity = useSharedValue(isSleepy ? 0.5 : 1);

  useEffect(() => {
    // Floating animation
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Wobble animation
    wobble.value = withRepeat(
      withSequence(
        withTiming(-2, { duration: 1500 }),
        withTiming(2, { duration: 1500 })
      ),
      -1,
      true
    );
  }, [floatY, wobble]);

  useEffect(() => {
    sleepyOpacity.value = withSpring(isSleepy ? 0.5 : 1);
  }, [isSleepy, sleepyOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { rotate: `${wobble.value}deg` },
      { scale: breathingScale },
    ],
    opacity: sleepyOpacity.value,
  }));

  const getMoodGlow = () => {
    if (!mood) return 'transparent';
    switch (mood) {
      case 'sunny':
        return 'rgba(255, 224, 102, 0.3)';
      case 'stormy':
        return 'rgba(139, 123, 176, 0.3)';
      default:
        return 'transparent';
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Glow effect based on mood */}
      <View
        style={[
          styles.glowEffect,
          {
            backgroundColor: getMoodGlow(),
            width: size * 1.3,
            height: size * 1.3,
          },
        ]}
      />

      {/* Ripple effect under character */}
      <RippleEffect size={size} />

      <Animated.View style={[styles.characterContainer, animatedStyle]}>
        {/* Character based on type */}
        <CharacterSprite type={type} size={size} mood={mood} />

        {/* Equipped items */}
        {showAccessories && equippedItems.includes('mushroom_hat') && (
          <View style={[styles.accessory, styles.mushroomHat]}>
            <Text style={styles.accessoryEmoji}>🍄</Text>
          </View>
        )}

        {showAccessories && equippedItems.includes('cloud_scarf') && (
          <View style={[styles.accessory, styles.scarf]}>
            <Text style={styles.accessoryEmoji}>🧣</Text>
          </View>
        )}

        {showAccessories && equippedItems.includes('flower_petal') && (
          <View style={[styles.accessory, styles.flowerCrown]}>
            <Text style={styles.accessoryEmoji}>🌸</Text>
          </View>
        )}

        {/* Sleepy Zzz */}
        {isSleepy && <SleepyIndicator />}

        {/* Heart particles when happy */}
        {mood === 'sunny' && <HeartParticles />}
      </Animated.View>

      {/* Floating leaves for Mossy */}
      {type === 'mossy' && <FloatingLeaves />}
    </View>
  );
}

function CharacterSprite({ type, size, mood }: { type: PetType; size: number; mood?: MoodType | null }) {
  const getCharacterColors = () => {
    switch (type) {
      case 'glimmer':
        return {
          primary: '#FFD54F',
          secondary: '#FFECB3',
          accent: '#FFA000',
        };
      case 'puddle':
        return {
          primary: '#81D4FA',
          secondary: '#E1F5FE',
          accent: '#0288D1',
        };
      case 'mossy':
        return {
          primary: '#81C784',
          secondary: '#C8E6C9',
          accent: '#388E3C',
        };
    }
  };

  const colors = getCharacterColors();
  const characterSize = size * 0.8;

  // Different shapes for different characters
  if (type === 'glimmer') {
    return (
      <View style={[styles.starShape, { width: characterSize, height: characterSize }]}>
        <View style={[styles.starBody, { backgroundColor: colors.primary }]}>
          <View style={styles.face}>
            <View style={styles.eyeContainer}>
              <View style={[styles.eye, styles.eyeOpen]} />
              <View style={[styles.eye, styles.eyeOpen]} />
            </View>
            <View style={[styles.mouth, styles.happyMouth]} />
            <View style={[styles.cheek, styles.leftCheek]} />
            <View style={[styles.cheek, styles.rightCheek]} />
          </View>
        </View>
      </View>
    );
  }

  if (type === 'puddle') {
    return (
      <View style={[styles.dropShape, { width: characterSize, height: characterSize }]}>
        <View style={[styles.dropBody, { backgroundColor: colors.primary }]}>
          <View style={[styles.dropHighlight, { backgroundColor: colors.secondary }]} />
          <View style={styles.face}>
            <View style={styles.eyeContainer}>
              <View style={[styles.eye, styles.eyeCute]} />
              <View style={[styles.eye, styles.eyeCute]} />
            </View>
            <View style={[styles.mouth, styles.smallMouth]} />
          </View>
        </View>
      </View>
    );
  }

  // Mossy (default)
  return (
    <View style={[styles.mossyShape, { width: characterSize, height: characterSize }]}>
      <View style={[styles.mossyBody, { backgroundColor: colors.primary }]}>
        {/* Moss texture dots */}
        <View style={[styles.mossDot, { top: '20%', left: '25%', backgroundColor: colors.accent }]} />
        <View style={[styles.mossDot, { top: '35%', left: '65%', backgroundColor: colors.secondary }]} />
        <View style={[styles.mossDot, { top: '55%', left: '40%', backgroundColor: colors.accent }]} />
        <View style={[styles.mossDot, { top: '25%', right: '20%', backgroundColor: colors.secondary }]} />

        <View style={styles.face}>
          <View style={styles.eyeContainer}>
            <View style={[styles.eye, mood === 'sunny' ? styles.happyEye : styles.peacefulEye]} />
            <View style={[styles.eye, mood === 'sunny' ? styles.happyEye : styles.peacefulEye]} />
          </View>
          <View style={[styles.mouth, styles.contentMouth]} />
          {/* Rosy cheeks */}
          <View style={[styles.rosyCheek, styles.leftRosyCheek]} />
          <View style={[styles.rosyCheek, styles.rightRosyCheek]} />
        </View>
      </View>
    </View>
  );
}

function RippleEffect({ size }: { size: number }) {
  const scale1 = useSharedValue(0.8);
  const scale2 = useSharedValue(0.6);
  const opacity1 = useSharedValue(0.3);
  const opacity2 = useSharedValue(0.2);

  useEffect(() => {
    scale1.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 3000 }),
        withTiming(0.8, { duration: 0 })
      ),
      -1
    );
    opacity1.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 3000 }),
        withTiming(0.3, { duration: 0 })
      ),
      -1
    );
    scale2.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 3000 }),
        withTiming(0.6, { duration: 0 })
      ),
      -1
    );
    opacity2.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 3000 }),
        withTiming(0.2, { duration: 0 })
      ),
      -1
    );
  }, [scale1, scale2, opacity1, opacity2]);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
    opacity: opacity1.value,
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
    opacity: opacity2.value,
  }));

  return (
    <View style={[styles.rippleContainer, { width: size, height: size * 0.3 }]}>
      <Animated.View style={[styles.ripple, { width: size * 0.6 }, animatedStyle1]} />
      <Animated.View style={[styles.ripple, { width: size * 0.4 }, animatedStyle2]} />
    </View>
  );
}

function SleepyIndicator() {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 1500 }),
        withTiming(0, { duration: 0 })
      ),
      -1
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1500 }),
        withTiming(1, { duration: 0 })
      ),
      -1
    );
  }, [translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.sleepyContainer, animatedStyle]}>
      <Text style={styles.sleepyText}>💤</Text>
    </Animated.View>
  );
}

function HeartParticles() {
  return (
    <View style={styles.particlesContainer}>
      <FloatingParticle emoji="💕" delay={0} />
      <FloatingParticle emoji="✨" delay={500} />
      <FloatingParticle emoji="💕" delay={1000} />
    </View>
  );
}

function FloatingParticle({ emoji, delay }: { emoji: string; delay: number }) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      translateY.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(-40, { duration: 2000 }),
          withTiming(-40, { duration: 0 })
        ),
        -1
      );
      translateX.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(Math.random() * 20 - 10, { duration: 2000 }),
          withTiming(0, { duration: 0 })
        ),
        -1
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0, { duration: 1500 }),
          withTiming(0, { duration: 0 })
        ),
        -1
      );
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay, translateY, translateX, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.particle, animatedStyle]}>
      <Text style={styles.particleText}>{emoji}</Text>
    </Animated.View>
  );
}

function FloatingLeaves() {
  return (
    <View style={styles.leavesContainer}>
      <FloatingParticle emoji="🍃" delay={0} />
      <FloatingParticle emoji="🍃" delay={1500} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    borderRadius: 999,
  },
  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Star shape for Glimmer
  starShape: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  starBody: {
    width: '80%',
    height: '80%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Drop shape for Puddle
  dropShape: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropBody: {
    width: '75%',
    height: '85%',
    borderRadius: 999,
    borderTopLeftRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropHighlight: {
    position: 'absolute',
    top: '15%',
    left: '20%',
    width: '20%',
    height: '15%',
    borderRadius: 999,
    opacity: 0.6,
  },
  // Mossy shape
  mossyShape: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mossyBody: {
    width: '85%',
    height: '75%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mossDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.7,
  },
  // Face elements
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  eyeContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 8,
  },
  eye: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  eyeOpen: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  eyeCute: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  happyEye: {
    width: 10,
    height: 5,
    borderRadius: 5,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  peacefulEye: {
    width: 12,
    height: 3,
    borderRadius: 2,
  },
  mouth: {
    width: 12,
    height: 6,
    borderRadius: 6,
    backgroundColor: '#FF9999',
  },
  happyMouth: {
    width: 16,
    height: 10,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  smallMouth: {
    width: 8,
    height: 4,
  },
  contentMouth: {
    width: 10,
    height: 5,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  cheek: {
    position: 'absolute',
    width: 16,
    height: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 150, 150, 0.4)',
  },
  leftCheek: {
    left: '20%',
    top: '55%',
  },
  rightCheek: {
    right: '20%',
    top: '55%',
  },
  rosyCheek: {
    position: 'absolute',
    width: 14,
    height: 8,
    borderRadius: 7,
    backgroundColor: 'rgba(210, 140, 100, 0.5)',
    top: '55%',
  },
  leftRosyCheek: {
    left: '18%',
  },
  rightRosyCheek: {
    right: '18%',
  },
  // Ripple
  rippleContainer: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    height: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'transparent',
  },
  // Accessories
  accessory: {
    position: 'absolute',
  },
  mushroomHat: {
    top: -20,
    right: 10,
  },
  scarf: {
    bottom: 20,
    left: 0,
  },
  flowerCrown: {
    top: -10,
    left: 10,
  },
  accessoryEmoji: {
    fontSize: 24,
  },
  // Sleepy
  sleepyContainer: {
    position: 'absolute',
    top: -10,
    right: 0,
  },
  sleepyText: {
    fontSize: 20,
  },
  // Particles
  particlesContainer: {
    position: 'absolute',
    top: -20,
    width: '100%',
    alignItems: 'center',
  },
  leavesContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  particle: {
    position: 'absolute',
  },
  particleText: {
    fontSize: 16,
  },
});
