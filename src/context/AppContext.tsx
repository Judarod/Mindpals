import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserState, INITIAL_USER_STATE, MoodType, ItemId, PetType } from '../constants/types';
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
  | { type: 'RESET_DAILY' };

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
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

      return {
        ...state,
        todayMood: action.payload,
        hasCheckedInToday: true,
        lastCheckInDate: today,
        sunBits: state.sunBits + REWARDS.checkIn + streakBonus,
        currentStreak: newStreak,
        longestStreak: Math.max(state.longestStreak, newStreak),
        isSleepy: false,
      };
    }

    case 'COMPLETE_MEDITATION': {
      const minutes = Math.floor(action.payload.duration / 60);
      let reward = REWARDS.meditation1min;

      if (minutes >= 5) {
        reward = REWARDS.meditation5min;
      } else if (minutes >= 3) {
        reward = REWARDS.meditation3min;
      }

      const newTotalMinutes = state.totalMeditationMinutes + minutes;
      const newZenLevel = Math.floor(newTotalMinutes / 10) + 1;

      return {
        ...state,
        sunBits: state.sunBits + reward,
        totalMeditationMinutes: newTotalMinutes,
        zenLevel: newZenLevel,
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

    case 'RESET_DAILY': {
      const today = getTodayDate();
      if (state.lastCheckInDate === today) return state;

      // Check if streak should reset (missed more than a day)
      const lastDate = state.lastCheckInDate ? new Date(state.lastCheckInDate) : null;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const streakBroken = lastDate && state.lastCheckInDate !== yesterday;

      return {
        ...state,
        hasCheckedInToday: false,
        todayMood: null,
        isSleepy: true,
        currentStreak: streakBroken ? 0 : state.currentStreak,
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
          dispatch({ type: 'LOAD_STATE', payload: { ...INITIAL_USER_STATE, ...parsedState } });
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

  // Check for daily reset
  useEffect(() => {
    dispatch({ type: 'RESET_DAILY' });

    // Set up interval to check at midnight
    const checkMidnight = setInterval(() => {
      dispatch({ type: 'RESET_DAILY' });
    }, 60000); // Check every minute

    return () => clearInterval(checkMidnight);
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
