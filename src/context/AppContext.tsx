import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserState,
  INITIAL_USER_STATE,
  INITIAL_PET_NEEDS,
  MoodType,
  ItemId,
  PetType,
  PetNeeds,
  NEED_DECAY_RATES,
  NEED_INCREASES,
  DAILY_LIMITS,
} from '../constants/types';
import { REWARDS } from '../constants/theme';

const STORAGE_KEY = '@cloudlings_user_state';

type AppAction =
  | { type: 'LOAD_STATE'; payload: UserState }
  | { type: 'SELECT_PET'; payload: { pet: PetType; name: string } }
  | { type: 'CHECK_IN'; payload: MoodType }
  | { type: 'COMPLETE_MEDITATION'; payload: { duration: number } }
  | { type: 'PURCHASE_ITEM'; payload: { itemId: ItemId; price: number } }
  | { type: 'EQUIP_ITEM'; payload: ItemId }
  | { type: 'UNEQUIP_ITEM'; payload: ItemId }
  | { type: 'WAKE_UP' }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'RESET_DAILY' }
  | { type: 'PET_CLOUDLING' }
  | { type: 'FEED_AFFIRMATION' }
  | { type: 'UPDATE_NEEDS_DECAY' };

interface AppContextType {
  state: UserState;
  selectPet: (pet: PetType, name: string) => void;
  checkIn: (mood: MoodType) => void;
  completeMeditation: (duration: number) => void;
  purchaseItem: (itemId: ItemId, price: number) => void;
  equipItem: (itemId: ItemId) => void;
  unequipItem: (itemId: ItemId) => void;
  wakeUp: () => void;
  completeOnboarding: () => void;
  petCloudling: () => boolean; // Returns true if pet was successful
  feedAffirmation: () => boolean; // Returns true if affirmation was successful
  canPet: () => boolean;
  canFeedAffirmation: () => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Calculate need decay based on time passed
function calculateDecayedNeeds(needs: PetNeeds): PetNeeds {
  const now = new Date();
  const lastUpdate = new Date(needs.lastUpdated);
  const hoursPassed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

  if (hoursPassed < 0.1) return needs; // Less than 6 minutes, no decay

  return {
    calm: Math.max(0, needs.calm - NEED_DECAY_RATES.calm * hoursPassed),
    glow: Math.max(0, needs.glow - NEED_DECAY_RATES.glow * hoursPassed),
    bond: Math.max(0, needs.bond - NEED_DECAY_RATES.bond * hoursPassed),
    lastUpdated: now.toISOString(),
  };
}

// Increase needs with cap at 100
function increaseNeeds(
  needs: PetNeeds,
  increases: { calm: number; glow: number; bond: number }
): PetNeeds {
  return {
    calm: Math.min(100, needs.calm + increases.calm),
    glow: Math.min(100, needs.glow + increases.glow),
    bond: Math.min(100, needs.bond + increases.bond),
    lastUpdated: new Date().toISOString(),
  };
}

function appReducer(state: UserState, action: AppAction): UserState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'SELECT_PET':
      return {
        ...state,
        selectedPet: action.payload.pet,
        petName: action.payload.name,
      };

    case 'CHECK_IN': {
      const today = getTodayDate();
      const wasYesterday = state.lastCheckInDate ===
        new Date(Date.now() - 86400000).toISOString().split('T')[0];

      const newStreak = wasYesterday ? state.currentStreak + 1 : 1;
      const streakBonus = newStreak > 1 ? REWARDS.streakBonus * (newStreak - 1) : 0;

      // Apply decay first, then increase
      const decayedNeeds = calculateDecayedNeeds(state.petNeeds);
      const newNeeds = increaseNeeds(decayedNeeds, NEED_INCREASES.checkIn);

      return {
        ...state,
        todayMood: action.payload,
        hasCheckedInToday: true,
        lastCheckInDate: today,
        sunBits: state.sunBits + REWARDS.checkIn + streakBonus,
        currentStreak: newStreak,
        longestStreak: Math.max(state.longestStreak, newStreak),
        isSleepy: false,
        petNeeds: newNeeds,
      };
    }

    case 'COMPLETE_MEDITATION': {
      const minutes = Math.floor(action.payload.duration / 60);
      let reward = REWARDS.meditation1min;
      let needIncrease = NEED_INCREASES.meditation1min;

      if (minutes >= 5) {
        reward = REWARDS.meditation5min;
        needIncrease = NEED_INCREASES.meditation5min;
      } else if (minutes >= 3) {
        reward = REWARDS.meditation3min;
        needIncrease = NEED_INCREASES.meditation3min;
      }

      const newTotalMinutes = state.totalMeditationMinutes + minutes;
      const newZenLevel = Math.floor(newTotalMinutes / 10) + 1;

      const decayedNeeds = calculateDecayedNeeds(state.petNeeds);
      const newNeeds = increaseNeeds(decayedNeeds, needIncrease);

      return {
        ...state,
        sunBits: state.sunBits + reward,
        totalMeditationMinutes: newTotalMinutes,
        zenLevel: newZenLevel,
        petNeeds: newNeeds,
      };
    }

    case 'PURCHASE_ITEM': {
      const { itemId, price } = action.payload;
      if (state.ownedItems.includes(itemId)) return state;
      if (state.sunBits < price) return state;

      return {
        ...state,
        ownedItems: [...state.ownedItems, itemId],
        sunBits: state.sunBits - price,
      };
    }

    case 'EQUIP_ITEM': {
      const item = action.payload;
      if (!state.ownedItems.includes(item)) return state;
      if (state.equippedItems.includes(item)) return state;

      return {
        ...state,
        equippedItems: [...state.equippedItems, item],
      };
    }

    case 'UNEQUIP_ITEM': {
      return {
        ...state,
        equippedItems: state.equippedItems.filter(i => i !== action.payload),
      };
    }

    case 'WAKE_UP':
      return {
        ...state,
        isSleepy: false,
      };

    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        hasCompletedOnboarding: true,
      };

    case 'PET_CLOUDLING': {
      const now = new Date().toISOString();
      const decayedNeeds = calculateDecayedNeeds(state.petNeeds);
      const newNeeds = increaseNeeds(decayedNeeds, NEED_INCREASES.pet);

      return {
        ...state,
        petNeeds: newNeeds,
        lastPetTime: now,
        todayPetCount: state.todayPetCount + 1,
        // Small Sun-Bit reward for bonding
        sunBits: state.sunBits + 1,
      };
    }

    case 'FEED_AFFIRMATION': {
      const decayedNeeds = calculateDecayedNeeds(state.petNeeds);
      const newNeeds = increaseNeeds(decayedNeeds, NEED_INCREASES.affirmation);

      return {
        ...state,
        petNeeds: newNeeds,
        todayAffirmationCount: state.todayAffirmationCount + 1,
        // Reward for self-care
        sunBits: state.sunBits + 3,
      };
    }

    case 'UPDATE_NEEDS_DECAY': {
      const decayedNeeds = calculateDecayedNeeds(state.petNeeds);
      return {
        ...state,
        petNeeds: decayedNeeds,
      };
    }

    case 'RESET_DAILY': {
      const today = getTodayDate();
      if (state.lastCheckInDate === today) return state;

      // Check if streak should reset (missed more than a day)
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const streakBroken = state.lastCheckInDate && state.lastCheckInDate !== yesterday;

      // Apply decay to needs
      const decayedNeeds = calculateDecayedNeeds(state.petNeeds);

      return {
        ...state,
        hasCheckedInToday: false,
        todayMood: null,
        isSleepy: true,
        currentStreak: streakBroken ? 0 : state.currentStreak,
        todayPetCount: 0, // Reset daily pet count
        todayAffirmationCount: 0, // Reset daily affirmation count
        petNeeds: decayedNeeds,
      };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, INITIAL_USER_STATE);

  // Load state from storage on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedState = JSON.parse(stored);
          // Ensure petNeeds exists (for backwards compatibility)
          const loadedState = {
            ...INITIAL_USER_STATE,
            ...parsedState,
            petNeeds: parsedState.petNeeds || INITIAL_PET_NEEDS,
          };
          dispatch({ type: 'LOAD_STATE', payload: loadedState });
        }
      } catch (error) {
        console.error('Failed to load state:', error);
      }
    };
    loadState();
  }, []);

  // Save state to storage on changes
  useEffect(() => {
    const saveState = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save state:', error);
      }
    };
    saveState();
  }, [state]);

  // Check for daily reset and update needs decay periodically
  useEffect(() => {
    dispatch({ type: 'RESET_DAILY' });
    dispatch({ type: 'UPDATE_NEEDS_DECAY' });

    // Update decay every 5 minutes
    const updateInterval = setInterval(() => {
      dispatch({ type: 'UPDATE_NEEDS_DECAY' });
      dispatch({ type: 'RESET_DAILY' });
    }, 300000); // 5 minutes

    return () => clearInterval(updateInterval);
  }, []);

  const selectPet = (pet: PetType, name: string) => {
    dispatch({ type: 'SELECT_PET', payload: { pet, name } });
  };

  const checkIn = (mood: MoodType) => {
    dispatch({ type: 'CHECK_IN', payload: mood });
  };

  const completeMeditation = (duration: number) => {
    dispatch({ type: 'COMPLETE_MEDITATION', payload: { duration } });
  };

  const purchaseItem = (itemId: ItemId, price: number) => {
    if (!state.ownedItems.includes(itemId) && state.sunBits >= price) {
      dispatch({ type: 'PURCHASE_ITEM', payload: { itemId, price } });
    }
  };

  const equipItem = (itemId: ItemId) => {
    dispatch({ type: 'EQUIP_ITEM', payload: itemId });
  };

  const unequipItem = (itemId: ItemId) => {
    dispatch({ type: 'UNEQUIP_ITEM', payload: itemId });
  };

  const wakeUp = () => {
    dispatch({ type: 'WAKE_UP' });
  };

  const completeOnboarding = () => {
    dispatch({ type: 'COMPLETE_ONBOARDING' });
  };

  const canPet = (): boolean => {
    if (state.todayPetCount >= DAILY_LIMITS.maxPets) return false;
    if (!state.lastPetTime) return true;

    const timeSinceLastPet = Date.now() - new Date(state.lastPetTime).getTime();
    return timeSinceLastPet >= DAILY_LIMITS.petCooldownMs;
  };

  const petCloudling = (): boolean => {
    if (!canPet()) return false;
    dispatch({ type: 'PET_CLOUDLING' });
    return true;
  };

  const canFeedAffirmation = (): boolean => {
    return state.todayAffirmationCount < DAILY_LIMITS.maxAffirmations;
  };

  const feedAffirmation = (): boolean => {
    if (!canFeedAffirmation()) return false;
    dispatch({ type: 'FEED_AFFIRMATION' });
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        state,
        selectPet,
        checkIn,
        completeMeditation,
        purchaseItem,
        equipItem,
        unequipItem,
        wakeUp,
        completeOnboarding,
        petCloudling,
        feedAffirmation,
        canPet,
        canFeedAffirmation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
