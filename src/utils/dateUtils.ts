
import { format, parseISO } from 'date-fns';

/**
 * Safely formats a date string to the specified format
 * @param dateString Date string to format
 * @param formatStr Format string for date-fns
 * @param fallback Fallback string if the date is invalid
 * @returns Formatted date string or fallback
 */
export const safeFormatDate = (
  dateString: string | undefined, 
  formatStr: string = 'MMM dd, yyyy',
  fallback: string = 'N/A'
): string => {
  if (!dateString) return fallback;
  
  try {
    const date = parseISO(dateString);
    return format(date, formatStr);
  } catch (error) {
    console.error("Invalid date format:", dateString, error);
    return fallback;
  }
};
