// Cloudlings Type Definitions

export type PetType = 'glimmer' | 'puddle' | 'mossy';

export type MoodType = 'sunny' | 'cloudy' | 'stormy' | 'drizzly';

export type ItemId = 'mushroom_hat' | 'cloud_scarf' | 'lotus_perch' | 'campfire' | 'flower_petal';

// Pet mood based on care level
export type PetMoodState = 'ecstatic' | 'happy' | 'content' | 'sleepy' | 'lonely';

// Evolution stages unlock at certain Zen Levels
export type EvolutionStage = 'baby' | 'child' | 'teen' | 'adult' | 'enlightened';

export interface ShopItem {
  id: ItemId;
  name: string;
  price: number;
  emoji: string;
  description: string;
}

export interface PetNeeds {
  // Calm: 0-100, increases with meditation, slowly decays
  calm: number;
  // Glow: 0-100, increases with check-ins and affirmations, decays faster
  glow: number;
  // Bond: 0-100, increases with interactions (taps, affirmations), decays slowly
  bond: number;
  // Last time needs were updated (for decay calculation)
  lastUpdated: string;
}

export interface UserState {
  // Pet selection
  selectedPet: PetType;
  petName: string;

  // Currency
  sunBits: number;

  // Progression
  zenLevel: number;
  totalMeditationMinutes: number;

  // Daily tracking
  lastCheckInDate: string | null;
  todayMood: MoodType | null;
  hasCheckedInToday: boolean;

  // Streak tracking
  currentStreak: number;
  longestStreak: number;

  // Inventory
  ownedItems: ItemId[];
  equippedItems: ItemId[];

  // Pet state
  isSleepy: boolean;
  petNeeds: PetNeeds;
  lastPetTime: string | null; // Last time user tapped/pet the cloudling
  todayPetCount: number; // Limited pets per day for anticipation
  todayAffirmationCount: number; // Limited affirmations per day

  // Onboarding
  hasCompletedOnboarding: boolean;
}

export interface MeditationSession {
  date: string;
  duration: number; // in seconds
  mood: MoodType;
}

export const INITIAL_PET_NEEDS: PetNeeds = {
  calm: 50,
  glow: 50,
  bond: 30,
  lastUpdated: new Date().toISOString(),
};

export const INITIAL_USER_STATE: UserState = {
  selectedPet: 'mossy',
  petName: 'Mossy',
  sunBits: 0,
  zenLevel: 1,
  totalMeditationMinutes: 0,
  lastCheckInDate: null,
  todayMood: null,
  hasCheckedInToday: false,
  currentStreak: 0,
  longestStreak: 0,
  ownedItems: [],
  equippedItems: [],
  isSleepy: true,
  petNeeds: INITIAL_PET_NEEDS,
  lastPetTime: null,
  todayPetCount: 0,
  todayAffirmationCount: 0,
  hasCompletedOnboarding: false,
};

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'mushroom_hat',
    name: 'Mushroom Hat',
    price: 30,
    emoji: '🍄',
    description: 'A cute mushroom cap for your pal!',
  },
  {
    id: 'cloud_scarf',
    name: 'Cloud Scarf',
    price: 40,
    emoji: '🧣',
    description: 'A fluffy cloud-like scarf.',
  },
  {
    id: 'lotus_perch',
    name: 'Lotus Perch',
    price: 60,
    emoji: '🪷',
    description: 'A peaceful lotus flower to sit on.',
  },
  {
    id: 'campfire',
    name: 'Campfire',
    price: 75,
    emoji: '🔥',
    description: 'A cozy campfire for chilly evenings.',
  },
  {
    id: 'flower_petal',
    name: 'Flower Crown',
    price: 50,
    emoji: '🌸',
    description: 'A beautiful flower crown.',
  },
];

export const PET_NAMES: Record<PetType, string> = {
  glimmer: 'Glimmer',
  puddle: 'Puddle',
  mossy: 'Mossy',
};

export const PET_DESCRIPTIONS: Record<PetType, string> = {
  glimmer: 'High-energy & bouncy',
  puddle: 'Calm & flowing',
  mossy: 'Grounded & peaceful',
};

export const MOOD_CONFIG: Record<MoodType, { label: string; emoji: string; color: string }> = {
  sunny: { label: 'Sunny', emoji: '☀️', color: '#FFE066' },
  cloudy: { label: 'Cloudy', emoji: '☁️', color: '#B8D4E8' },
  stormy: { label: 'Stormy', emoji: '⚡', color: '#8B7BB0' },
  drizzly: { label: 'Drizzly', emoji: '💧', color: '#A8D5E5' },
};

// Evolution thresholds based on Zen Level
export const EVOLUTION_THRESHOLDS: Record<EvolutionStage, number> = {
  baby: 1,
  child: 3,
  teen: 7,
  adult: 15,
  enlightened: 30,
};

// Get evolution stage from zen level
export function getEvolutionStage(zenLevel: number): EvolutionStage {
  if (zenLevel >= EVOLUTION_THRESHOLDS.enlightened) return 'enlightened';
  if (zenLevel >= EVOLUTION_THRESHOLDS.adult) return 'adult';
  if (zenLevel >= EVOLUTION_THRESHOLDS.teen) return 'teen';
  if (zenLevel >= EVOLUTION_THRESHOLDS.child) return 'child';
  return 'baby';
}

// Get pet mood based on needs
export function getPetMoodState(needs: PetNeeds): PetMoodState {
  const average = (needs.calm + needs.glow + needs.bond) / 3;

  if (average >= 80) return 'ecstatic';
  if (average >= 60) return 'happy';
  if (average >= 40) return 'content';
  if (average >= 20) return 'sleepy';
  return 'lonely';
}

// Affirmations the user can "feed" to their pet
export const AFFIRMATIONS: string[] = [
  "I am worthy of love and kindness",
  "Today I choose peace",
  "I am doing my best, and that's enough",
  "I deserve rest and relaxation",
  "My feelings are valid",
  "I am growing every day",
  "I choose to be gentle with myself",
  "This moment is temporary",
  "I am stronger than I think",
  "I breathe in calm, breathe out stress",
  "I am grateful for this moment",
  "I trust my journey",
  "I release what I cannot control",
  "I am surrounded by love",
  "My peace is my priority",
];

// Limits for daily interactions (creates anticipation like Tamagotchi)
export const DAILY_LIMITS = {
  maxPets: 10, // Can pet cloudling 10 times per day
  maxAffirmations: 5, // Can feed 5 affirmations per day
  petCooldownMs: 3000, // 3 seconds between pets
};

// Need decay rates (per hour)
export const NEED_DECAY_RATES = {
  calm: 2, // Loses 2 points per hour
  glow: 3, // Loses 3 points per hour
  bond: 1, // Loses 1 point per hour
};

// Need increase amounts
export const NEED_INCREASES = {
  meditation1min: { calm: 10, glow: 5, bond: 3 },
  meditation3min: { calm: 20, glow: 10, bond: 5 },
  meditation5min: { calm: 35, glow: 15, bond: 8 },
  checkIn: { calm: 5, glow: 15, bond: 5 },
  pet: { calm: 2, glow: 5, bond: 8 },
  affirmation: { calm: 8, glow: 12, bond: 6 },
};
