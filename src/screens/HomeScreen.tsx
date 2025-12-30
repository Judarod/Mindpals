import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, Animated as RNAnimated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { DynamicBackground, Header, PetCharacter, MoodButton, SpeechBubble } from '../components';
import { useApp } from '../context/AppContext';
import { MoodType, MOOD_CONFIG } from '../constants/types';
import { SPACING, COLORS, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { getGreeting, getEncouragingMessage } from '../utils/helpers';

const { width, height } = Dimensions.get('window');

export function HomeScreen() {
  const { state, checkIn, wakeUp } = useApp();
  const insets = useSafeAreaInsets();
  const [showFog, setShowFog] = useState(!state.hasCheckedInToday);
  const fogOpacity = useSharedValue(state.hasCheckedInToday ? 0 : 0.9);

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

  const fogStyle = useAnimatedStyle(() => ({
    opacity: fogOpacity.value,
  }));

  const getMessage = () => {
    if (!state.hasCheckedInToday) {
      return `${getGreeting()}\nHow's your sky today?`;
    }
    return getEncouragingMessage(state.isSleepy, state.todayMood, state.petName);
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
              variant={state.todayMood === 'sunny' ? 'excited' : 'default'}
            />
          </View>

          {/* Character */}
          <View style={styles.characterContainer}>
            <PetCharacter
              type={state.selectedPet}
              mood={state.todayMood}
              isSleepy={!state.hasCheckedInToday}
              equippedItems={state.equippedItems}
            />
          </View>

          {/* Mood selection or status message */}
          {!state.hasCheckedInToday ? (
            <Animated.View
              entering={FadeIn.duration(500)}
              style={styles.moodSelector}
            >
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
            <Animated.View
              entering={FadeIn.duration(500).delay(300)}
              style={styles.statusContainer}
            >
              <View style={styles.statusBadge}>
                <Text style={styles.statusIcon}>✨</Text>
                <Text style={styles.statusText}>
                  {state.petName} looks peaceful!
                </Text>
              </View>

              {state.currentStreak > 1 && (
                <View style={styles.streakBadge}>
                  <Text style={styles.streakIcon}>🔥</Text>
                  <Text style={styles.streakText}>
                    {state.currentStreak} day streak!
                  </Text>
                </View>
              )}
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
      </View>
    </DynamicBackground>
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
  moodSelector: {
    width: '100%',
    gap: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  moodRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statusContainer: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.soft,
  },
  statusIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  statusText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 200, 100, 0.3)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
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
  fogOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    zIndex: 10,
  },
});
