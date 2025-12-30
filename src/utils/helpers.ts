import { COLORS } from '../constants/theme';

/**
 * Get background gradient colors based on time of day
 */
export function getTimeBasedBackground(): string[] {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    // Morning (5 AM - 12 PM)
    return COLORS.morning;
  } else if (hour >= 12 && hour < 17) {
    // Afternoon (12 PM - 5 PM)
    return COLORS.afternoon;
  } else if (hour >= 17 && hour < 21) {
    // Evening (5 PM - 9 PM)
    return COLORS.evening;
  } else {
    // Night (9 PM - 5 AM)
    return COLORS.night;
  }
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return 'Good morning!';
  } else if (hour >= 12 && hour < 17) {
    return 'Good afternoon!';
  } else if (hour >= 17 && hour < 21) {
    return 'Good evening!';
  } else {
    return 'Good night!';
  }
}

/**
 * Format seconds to MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format current time to display
 */
export function getCurrentTime(): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Calculate battery percentage based on mood and activities
 */
export function calculateBatteryLevel(
  hasCheckedIn: boolean,
  meditatedToday: boolean
): number {
  let level = 20; // Base level
  if (hasCheckedIn) level += 30;
  if (meditatedToday) level += 50;
  return Math.min(level, 100);
}

/**
 * Get encouraging message based on state
 */
export function getEncouragingMessage(
  isSleepy: boolean,
  mood: string | null,
  petName: string
): string {
  if (isSleepy) {
    return `${petName} is waiting for you!`;
  }

  switch (mood) {
    case 'sunny':
      return `${petName} looks radiant!`;
    case 'cloudy':
      return `${petName} is here for you.`;
    case 'stormy':
      return `${petName} understands.`;
    case 'drizzly':
      return `${petName} feels cozy.`;
    default:
      return `${petName} looks peaceful!`;
  }
}
