import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { DynamicBackground, Header, BreathingCircle, SpeechBubble } from '../components';
import { useApp } from '../context/AppContext';
import { SPACING, COLORS, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');

const DURATION_OPTIONS = [
  { label: '1 min', value: 60 },
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
];

export function ZenScreen() {
  const { state, completeMeditation } = useApp();
  const insets = useSafeAreaInsets();

  const [selectedDuration, setSelectedDuration] = useState(180); // 3 minutes default
  const [isActive, setIsActive] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  const handleStart = () => {
    setIsActive(true);
    setShowComplete(false);
  };

  const handleComplete = useCallback(() => {
    setIsActive(false);
    setShowComplete(true);
    completeMeditation(selectedDuration);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Hide completion message after 5 seconds
    setTimeout(() => {
      setShowComplete(false);
    }, 5000);
  }, [selectedDuration, completeMeditation]);

  const handleDurationSelect = async (duration: number) => {
    if (isActive) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDuration(duration);
  };

  const getMessage = () => {
    if (showComplete) {
      return "Well done! You've earned some Sun-Bits!";
    }
    if (isActive) {
      return "Breathe with me...";
    }
    return "I'm here to help your mind grow, like a little forest!";
  };

  return (
    <DynamicBackground variant="zen">
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <Header showBattery={false} />

        <View style={styles.content}>
          {/* Message bubble */}
          <View style={styles.bubbleContainer}>
            <SpeechBubble
              message={getMessage()}
              variant={showComplete ? 'excited' : 'default'}
            />
          </View>

          {/* Breathing circle with character */}
          <View style={styles.breathingContainer}>
            <BreathingCircle
              duration={selectedDuration}
              onComplete={handleComplete}
              isActive={isActive}
              onStart={handleStart}
              petType={state.selectedPet}
            />
          </View>

          {/* Duration selector - only show when not active */}
          {!isActive && !showComplete && (
            <Animated.View
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(200)}
              style={styles.durationSelector}
            >
              <Text style={styles.selectorLabel}>Choose Duration</Text>
              <View style={styles.durationButtons}>
                {DURATION_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.durationButton,
                      selectedDuration === option.value && styles.durationButtonSelected,
                    ]}
                    onPress={() => handleDurationSelect(option.value)}
                  >
                    <Text
                      style={[
                        styles.durationText,
                        selectedDuration === option.value && styles.durationTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Completion reward display */}
          {showComplete && (
            <Animated.View
              entering={FadeIn.duration(500)}
              style={styles.rewardContainer}
            >
              <View style={styles.rewardBadge}>
                <Text style={styles.rewardIcon}>⭐</Text>
                <Text style={styles.rewardText}>
                  +{selectedDuration >= 300 ? 50 : selectedDuration >= 180 ? 30 : 15} Sun-Bits!
                </Text>
              </View>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => setShowComplete(false)}
              >
                <Text style={styles.continueText}>Continue</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Cancel button during meditation */}
          {isActive && (
            <Animated.View
              entering={FadeIn.duration(300).delay(500)}
              style={styles.cancelContainer}
            >
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsActive(false)}
              >
                <Text style={styles.cancelText}>End Early</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
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
    paddingHorizontal: SPACING.md,
  },
  bubbleContainer: {
    marginTop: SPACING.md,
  },
  breathingContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationSelector: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  selectorLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  durationButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  durationButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.card,
    minWidth: 80,
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  durationButtonSelected: {
    backgroundColor: COLORS.primary,
  },
  durationText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  durationTextSelected: {
    color: COLORS.white,
  },
  rewardContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  rewardIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  rewardText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: '#B8860B',
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  continueText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  cancelContainer: {
    marginBottom: SPACING.xl,
  },
  cancelButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  cancelText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
    fontWeight: '500',
  },
});
