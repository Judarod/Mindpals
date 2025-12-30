// MindPals Type Definitions

export type PetType = 'glimmer' | 'puddle' | 'mossy';

export type MoodType = 'sunny' | 'cloudy' | 'stormy' | 'drizzly';

export type ItemId = 'mushroom_hat' | 'cloud_scarf' | 'lotus_perch' | 'campfire' | 'flower_petal';

export interface ShopItem {
  id: ItemId;
  name: string;
  price: number;
  emoji: string;
  description: string;
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

  // Onboarding
  hasCompletedOnboarding: boolean;
}

export interface MeditationSession {
  date: string;
  duration: number; // in seconds
  mood: MoodType;
}

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
