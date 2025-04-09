/**
 * Converts an array of date strings to a marked dates object for react-native-calendars
 * @param dateStrings Array of ISO date strings
 * @param markerColor Color for the dots
 * @returns Object with dates as keys and marker styles as values
 */
export const getMarkedDatesFromArray = (
  dateStrings: string[], 
  markerColor: string
): Record<string, { marked: boolean; dotColor: string }> => {
  const markedDates: Record<string, { marked: boolean; dotColor: string }> = {};
  
  dateStrings.forEach(dateStr => {
    // Extract just the date part (YYYY-MM-DD) from the ISO string
    const formattedDate = new Date(dateStr).toISOString().split('T')[0];
    
    markedDates[formattedDate] = {
      marked: true,
      dotColor: markerColor,
    };
  });
  
  return markedDates;
};

/**
 * Format a date to display in a user-friendly format
 * @param date Date to format
 * @param format Format type ('short', 'medium', 'long')
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  format: 'short' | 'medium' | 'long' = 'medium'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return dateObj.toLocaleDateString(undefined, { 
      month: 'numeric', 
      day: 'numeric' 
    });
  } else if (format === 'medium') {
    return dateObj.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } else {
    return dateObj.toLocaleDateString(undefined, { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
};

/**
 * Check if a date is today
 * @param date Date to check
 * @returns True if the date is today
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * Get the start and end of a time period
 * @param period Time period ('week', 'month', 'year')
 * @returns Object with start and end dates
 */
export const getPeriodDates = (
  period: 'week' | 'month' | 'year'
): { start: Date; end: Date } => {
  const end = new Date();
  let start = new Date();
  
  if (period === 'week') {
    // Last 7 days
    start.setDate(start.getDate() - 6);
  } else if (period === 'month') {
    // Last 30 days
    start.setDate(start.getDate() - 29);
  } else {
    // Last 365 days
    start.setDate(start.getDate() - 364);
  }
  
  // Reset hours to get full days
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};
