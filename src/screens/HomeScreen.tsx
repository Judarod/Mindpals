import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  FadeIn,
  FadeOut,
  ZoomIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { DynamicBackground, Header, PetCharacter, MoodButton, SpeechBubble } from '../components';
import { useApp } from '../context/AppContext';
import {
  MoodType,
  getPetMoodState,
  getEvolutionStage,
  AFFIRMATIONS,
  DAILY_LIMITS,
} from '../constants/types';
import { SPACING, COLORS, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { getGreeting } from '../utils/helpers';

const { width } = Dimensions.get('window');

export function HomeScreen() {
  const { state, checkIn, petCloudling, canPet, feedAffirmation, canFeedAffirmation } = useApp();
  const insets = useSafeAreaInsets();
  const [showFog, setShowFog] = useState(!state.hasCheckedInToday);
  const [showHearts, setShowHearts] = useState(false);
  const [showAffirmationModal, setShowAffirmationModal] = useState(false);
  const [currentAffirmation, setCurrentAffirmation] = useState('');

  const fogOpacity = useSharedValue(state.hasCheckedInToday ? 0 : 0.9);
  const petScale = useSharedValue(1);

  const petMood = getPetMoodState(state.petNeeds);
  const evolutionStage = getEvolutionStage(state.zenLevel);

  useEffect(() => {
    if (state.hasCheckedInToday) {
      fogOpacity.value = withTiming(0, { duration: 800 });
      setTimeout(() => setShowFog(false), 800);
    }
  }, [state.hasCheckedInToday, fogOpacity]);

  const handleMoodSelect = async (mood: MoodType) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    checkIn(mood);
    fogOpacity.value = withTiming(0, { duration: 800 });
    setTimeout(() => setShowFog(false), 800);
  };

  const handlePetTap = async () => {
    if (!state.hasCheckedInToday) return;

    const success = petCloudling();
    if (success) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Bounce animation
      petScale.value = withSequence(
        withSpring(1.15, { damping: 4 }),
        withSpring(1, { damping: 6 })
      );
      // Show hearts
      setShowHearts(true);
      setTimeout(() => setShowHearts(false), 1500);
    } else {
      // Gentle feedback that petting is on cooldown
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
  };

  const handleAffirmationPress = () => {
    if (!canFeedAffirmation()) return;
    // Pick random affirmation
    const randomAffirmation = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
    setCurrentAffirmation(randomAffirmation);
    setShowAffirmationModal(true);
  };

  const handleAcceptAffirmation = async () => {
    const success = feedAffirmation();
    if (success) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Bounce animation
      petScale.value = withSequence(
        withSpring(1.1, { damping: 4 }),
        withSpring(1, { damping: 6 })
      );
      setShowHearts(true);
      setTimeout(() => setShowHearts(false), 1500);
    }
    setShowAffirmationModal(false);
  };

  const fogStyle = useAnimatedStyle(() => ({
    opacity: fogOpacity.value,
  }));

  const petAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: petScale.value }],
  }));

  const getMessage = () => {
    if (!state.hasCheckedInToday) {
      return `${getGreeting()}\nHow's your sky today?`;
    }

    // Messages based on pet mood state
    switch (petMood) {
      case 'ecstatic':
        return `${state.petName} is overjoyed! 💕`;
      case 'happy':
        return `${state.petName} feels loved!`;
      case 'content':
        return `${state.petName} is peaceful.`;
      case 'sleepy':
        return `${state.petName} could use some attention...`;
      case 'lonely':
        return `${state.petName} misses you...`;
      default:
        return `${state.petName} is here for you.`;
    }
  };

  const getPetMoodEmoji = () => {
    switch (petMood) {
      case 'ecstatic': return '🌟';
      case 'happy': return '✨';
      case 'content': return '☁️';
      case 'sleepy': return '💤';
      case 'lonely': return '🥺';
      default: return '✨';
    }
  };

  return (
    <DynamicBackground mood={state.todayMood} variant="home">
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <Header />

        <View style={styles.content}>
          {/* Speech bubble */}
          <View style={styles.bubbleContainer}>
            <SpeechBubble
              message={getMessage()}
              variant={petMood === 'ecstatic' ? 'excited' : 'default'}
            />
          </View>

          {/* Character - Tappable for petting */}
          <TouchableOpacity
            style={styles.characterContainer}
            onPress={handlePetTap}
            activeOpacity={0.9}
            disabled={!state.hasCheckedInToday}
          >
            <Animated.View style={petAnimatedStyle}>
              <PetCharacter
                type={state.selectedPet}
                mood={state.todayMood}
                isSleepy={!state.hasCheckedInToday || petMood === 'sleepy'}
                equippedItems={state.equippedItems}
              />
            </Animated.View>

            {/* Heart particles when petting */}
            {showHearts && <HeartParticles />}
          </TouchableOpacity>

          {/* Needs bars - Only show after check-in */}
          {state.hasCheckedInToday && (
            <Animated.View entering={FadeIn.duration(500)} style={styles.needsContainer}>
              <NeedBar label="Calm" value={state.petNeeds.calm} color="#81D4FA" emoji="🧘" />
              <NeedBar label="Glow" value={state.petNeeds.glow} color="#FFD54F" emoji="✨" />
              <NeedBar label="Bond" value={state.petNeeds.bond} color="#F48FB1" emoji="💕" />
            </Animated.View>
          )}

          {/* Mood selection or interaction buttons */}
          {!state.hasCheckedInToday ? (
            <Animated.View entering={FadeIn.duration(500)} style={styles.moodSelector}>
              <View style={styles.moodRow}>
                <MoodButton mood="sunny" onPress={handleMoodSelect} />
                <MoodButton mood="cloudy" onPress={handleMoodSelect} />
              </View>
              <View style={styles.moodRow}>
                <MoodButton mood="stormy" onPress={handleMoodSelect} />
                <MoodButton mood="drizzly" onPress={handleMoodSelect} />
              </View>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeIn.duration(500).delay(300)} style={styles.interactionContainer}>
              {/* Status badges */}
              <View style={styles.statusRow}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusEmoji}>{getPetMoodEmoji()}</Text>
                  <Text style={styles.statusText}>{petMood}</Text>
                </View>

                {state.currentStreak > 1 && (
                  <View style={styles.streakBadge}>
                    <Text style={styles.streakIcon}>🔥</Text>
                    <Text style={styles.streakText}>{state.currentStreak}</Text>
                  </View>
                )}

                <View style={styles.evolutionBadge}>
                  <Text style={styles.evolutionText}>{evolutionStage}</Text>
                </View>
              </View>

              {/* Interaction buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionButton, !canPet() && styles.actionButtonDisabled]}
                  onPress={handlePetTap}
                  disabled={!canPet()}
                >
                  <Text style={styles.actionEmoji}>🤗</Text>
                  <Text style={styles.actionLabel}>Pet</Text>
                  <Text style={styles.actionCount}>
                    {state.todayPetCount}/{DAILY_LIMITS.maxPets}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, !canFeedAffirmation() && styles.actionButtonDisabled]}
                  onPress={handleAffirmationPress}
                  disabled={!canFeedAffirmation()}
                >
                  <Text style={styles.actionEmoji}>💭</Text>
                  <Text style={styles.actionLabel}>Affirm</Text>
                  <Text style={styles.actionCount}>
                    {state.todayAffirmationCount}/{DAILY_LIMITS.maxAffirmations}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </View>

        {/* Fog overlay for wake-up effect */}
        {showFog && (
          <Animated.View
            style={[styles.fogOverlay, fogStyle]}
            pointerEvents={state.hasCheckedInToday ? 'none' : 'box-none'}
          />
        )}

        {/* Affirmation Modal */}
        <Modal
          visible={showAffirmationModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAffirmationModal(false)}
        >
          <View style={styles.modalOverlay}>
            <Animated.View entering={ZoomIn.duration(300)} style={styles.affirmationCard}>
              <Text style={styles.affirmationLabel}>Today's Affirmation</Text>
              <Text style={styles.affirmationText}>"{currentAffirmation}"</Text>
              <View style={styles.affirmationButtons}>
                <TouchableOpacity
                  style={styles.affirmationAccept}
                  onPress={handleAcceptAffirmation}
                >
                  <Text style={styles.affirmationAcceptText}>I accept this 💕</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.affirmationSkip}
                  onPress={() => setShowAffirmationModal(false)}
                >
                  <Text style={styles.affirmationSkipText}>Maybe later</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </DynamicBackground>
  );
}

// Need bar component
function NeedBar({ label, value, color, emoji }: { label: string; value: number; color: string; emoji: string }) {
  return (
    <View style={styles.needBar}>
      <Text style={styles.needEmoji}>{emoji}</Text>
      <View style={styles.needBarTrack}>
        <View style={[styles.needBarFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.needValue}>{Math.round(value)}</Text>
    </View>
  );
}

// Heart particles animation
function HeartParticles() {
  return (
    <View style={styles.heartsContainer} pointerEvents="none">
      {[0, 1, 2, 3, 4].map((i) => (
        <Animated.Text
          key={i}
          entering={FadeIn.duration(200).delay(i * 100)}
          exiting={FadeOut.duration(500)}
          style={[
            styles.heartParticle,
            {
              left: 30 + Math.random() * 60,
              top: -20 - Math.random() * 40,
            },
          ]}
        >
          {['💕', '💗', '💖', '✨', '💕'][i]}
        </Animated.Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  bubbleContainer: {
    marginTop: SPACING.md,
  },
  characterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  needsContainer: {
    width: '100%',
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  needBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  needEmoji: {
    fontSize: 14,
    width: 20,
  },
  needBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  needBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  needValue: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    width: 24,
    textAlign: 'right',
  },
  moodSelector: {
    width: '100%',
    gap: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  moodRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  interactionContainer: {
    width: '100%',
    gap: SPACING.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.soft,
  },
  statusEmoji: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 200, 100, 0.3)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  streakIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  streakText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  evolutionBadge: {
    backgroundColor: 'rgba(200, 180, 255, 0.3)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  evolutionText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  actionButton: {
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    minWidth: 90,
    ...SHADOWS.soft,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  actionLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionCount: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },
  fogOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    zIndex: 10,
  },
  heartsContainer: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    width: 100,
    height: 100,
  },
  heartParticle: {
    position: 'absolute',
    fontSize: 20,
  },
  // Affirmation Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  affirmationCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  affirmationLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  affirmationText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 28,
    marginBottom: SPACING.xl,
  },
  affirmationButtons: {
    width: '100%',
    gap: SPACING.sm,
  },
  affirmationAccept: {
    backgroundColor: '#F8BBD9',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  affirmationAcceptText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  affirmationSkip: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  affirmationSkipText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
  },
});
