/**
 * IconValidator - Utility for validating icon names for different icon families
 */

// Common valid Ionicons that we know work with Expo
const VALID_IONICONS = [
  // Home icons
  'home', 'home-outline',
  
  // Profile icons
  'person', 'person-outline', 
  
  // Journal icons
  'book', 'book-outline', 'journal', 'journal-outline',
  
  // Meditation/health icons
  'leaf', 'leaf-outline',
  'water', 'water-outline',
  'fitness', 'fitness-outline',
  'sunny', 'sunny-outline',
  'moon', 'moon-outline',
  'pulse', 'pulse-outline',
  'heart', 'heart-outline',
  
  // Achievement icons
  'trophy', 'trophy-outline',
  
  // Media player icons
  'play', 'play-outline',
  'pause', 'pause-outline',
  'refresh', 'refresh-outline',
  'flag', 'flag-outline',
  
  // UI icons
  'add', 'add-outline',
  'remove', 'remove-outline',
  'close', 'close-outline',
  'checkmark', 'checkmark-outline',
  'arrow-back', 'arrow-back-outline',
  'arrow-forward', 'arrow-forward-outline',
  'settings', 'settings-outline',
  'menu', 'menu-outline',
  'search', 'search-outline',
  'notifications', 'notifications-outline',
  'calendar', 'calendar-outline',
  'time', 'time-outline',
  'star', 'star-outline',
  'bookmark', 'bookmark-outline',
  'share', 'share-outline',
  'cloud', 'cloud-outline',
  'download', 'download-outline',
  'information', 'information-outline',
  'help', 'help-outline'
];

/**
 * Check if an Ionicons name is valid
 * @param name The icon name to check
 * @returns Whether the icon name is in our known valid list
 */
export const isValidIonicon = (name: string): boolean => {
  return VALID_IONICONS.includes(name);
};

/**
 * Get a fallback icon name if the provided one is invalid
 * @param name The original icon name
 * @param category The icon category ('home', 'profile', 'meditation', etc.)
 * @param focused Whether the icon is in focused state
 * @returns A valid icon name
 */
export const getFallbackIonicon = (
  name: string, 
  category: 'home' | 'profile' | 'meditation' | 'journal' | 'achievements' | 'ui' = 'ui',
  focused: boolean = false
): string => {
  // If the provided name is valid, return it
  if (isValidIonicon(name)) {
    return name;
  }
  
  // Get suffix based on focus state
  const suffix = focused ? '' : '-outline';
  
  // Return fallback based on category
  switch (category) {
    case 'home':
      return `home${suffix}`;
    case 'profile':
      return `person${suffix}`;
    case 'meditation':
      return `leaf${suffix}`;
    case 'journal':
      return `book${suffix}`;
    case 'achievements':
      return `trophy${suffix}`;
    case 'ui':
    default:
      return `help${suffix}`;
  }
};

export default {
  isValidIonicon,
  getFallbackIonicon,
  VALID_IONICONS
};