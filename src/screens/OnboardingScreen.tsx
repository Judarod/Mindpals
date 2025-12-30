import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { PetCharacter } from '../components';
import { useApp } from '../context/AppContext';
import { PetType, PET_NAMES, PET_DESCRIPTIONS } from '../constants/types';
import { SPACING, COLORS, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const PETS: PetType[] = ['glimmer', 'puddle', 'mossy'];

const PET_BACKGROUNDS: Record<PetType, [string, string, string]> = {
  glimmer: ['#FFE4B5', '#FFF8DC', '#FFE4B5'],
  puddle: ['#B8E4F0', '#E0F4FF', '#B8E4F0'],
  mossy: ['#98D982', '#C8E6C9', '#98D982'],
};

export function OnboardingScreen() {
  const { selectPet, completeOnboarding } = useApp();
  const insets = useSafeAreaInsets();
  const [selectedPet, setSelectedPet] = useState<PetType>('mossy');
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  const handlePetSelect = async (pet: PetType) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPet(pet);
  };

  const handleConfirm = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    selectPet(selectedPet, PET_NAMES[selectedPet]);
    completeOnboarding();
  };

  const handleContinue = () => {
    setStep('confirm');
  };

  return (
    <LinearGradient
      colors={PET_BACKGROUNDS[selectedPet]}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {step === 'select' ? (
          <Animated.View
            entering={FadeIn.duration(500)}
            exiting={SlideOutLeft.duration(300)}
            style={styles.selectContainer}
          >
            <Text style={styles.title}>Choose Your Pal!</Text>
            <Text style={styles.subtitle}>
              Your MindPal will be your companion on your wellness journey
            </Text>

            {/* Pet selection */}
            <View style={styles.petsContainer}>
              {PETS.map((pet) => (
                <TouchableOpacity
                  key={pet}
                  style={[
                    styles.petOption,
                    selectedPet === pet && styles.petOptionSelected,
                  ]}
                  onPress={() => handlePetSelect(pet)}
                >
                  <View style={styles.petPreview}>
                    <PetCharacter
                      type={pet}
                      size={width * 0.22}
                      showAccessories={false}
                    />
                  </View>
                  <Text style={[
                    styles.petName,
                    selectedPet === pet && styles.petNameSelected,
                  ]}>
                    {PET_NAMES[pet]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Selected pet info */}
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedName}>{PET_NAMES[selectedPet]}</Text>
              <Text style={styles.selectedDescription}>
                {PET_DESCRIPTIONS[selectedPet]}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueText}>Choose {PET_NAMES[selectedPet]}</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View
            entering={SlideInRight.duration(300)}
            style={styles.confirmContainer}
          >
            {/* Large character preview */}
            <View style={styles.largePreview}>
              <PetCharacter
                type={selectedPet}
                size={width * 0.6}
                showAccessories={false}
              />
            </View>

            <View style={styles.welcomeBox}>
              <Text style={styles.welcomeText}>
                Hi! I'm {PET_NAMES[selectedPet]}. I'm here to help your mind grow, like a little forest!
              </Text>
            </View>

            <Text style={styles.journeyTitle}>✨ Start Your Journey</Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={handleConfirm}
            >
              <Text style={styles.startIcon}>✦</Text>
              <Text style={styles.startText}>Learn More</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep('select')}
            >
              <Text style={styles.backText}>← Choose Different Pal</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Restore purchase link */}
        <TouchableOpacity style={styles.restoreButton}>
          <Text style={styles.restoreText}>Restore Purchase</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  selectContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    maxWidth: 280,
  },
  petsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  petOption: {
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  petOptionSelected: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  petPreview: {
    marginBottom: SPACING.sm,
  },
  petName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  petNameSelected: {
    color: COLORS.text,
  },
  selectedInfo: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  selectedName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  selectedDescription: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textLight,
  },
  continueButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  continueText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  confirmContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largePreview: {
    marginBottom: SPACING.md,
  },
  welcomeBox: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    maxWidth: 300,
    marginBottom: SPACING.xl,
    ...SHADOWS.soft,
  },
  welcomeText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  journeyTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.soft,
  },
  startIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
    color: COLORS.accent,
  },
  startText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  backButton: {
    paddingVertical: SPACING.sm,
  },
  backText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  restoreText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
    textDecorationLine: 'underline',
  },
});
