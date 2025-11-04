/**
 * Utility Functions for Formatting
 * Date, time, numbers, and other formatting utilities
 */

/**
 * Format date to localized string
 * @param date - Date string or Date object
 * @param format - Format type: 'short', 'medium', 'long', 'full'
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date | null | undefined,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return 'Invalid Date';

  const options: Intl.DateTimeFormatOptions = {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
    medium: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    },
    full: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    },
  }[format];

  return dateObj.toLocaleString('en-US', options);
}

/**
 * Format time to localized string
 * @param date - Date string or Date object
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return 'Invalid Time';

  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date to relative time (e.g., "2 hours ago", "in 3 days")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return 'Invalid Date';

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return diffSeconds <= 1 ? 'just now' : `${diffSeconds} seconds ago`;
  } else if (diffMinutes < 60) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffDays < 7) {
    return diffDays === 1 ? 'yesterday' : `${diffDays} days ago`;
  } else if (diffWeeks < 4) {
    return diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`;
  } else if (diffMonths < 12) {
    return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
  } else {
    return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
  }
}

/**
 * Format number with commas
 * @param num - Number to format
 * @returns Formatted number string (e.g., "1,234,567")
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return 'N/A';
  return num.toLocaleString('en-US');
}

/**
 * Format currency
 * @param amount - Amount to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = 'USD'
): string {
  if (amount === null || amount === undefined) return 'N/A';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format percentage
 * @param value - Value to format (0-100 or 0-1)
 * @param decimals - Number of decimal places
 * @param isDecimal - If true, value is 0-1, otherwise 0-100
 * @returns Formatted percentage string (e.g., "85.5%")
 */
export function formatPercentage(
  value: number | null | undefined,
  decimals: number = 1,
  isDecimal: boolean = false
): string {
  if (value === null || value === undefined) return 'N/A';

  const percent = isDecimal ? value * 100 : value;
  return `${percent.toFixed(decimals)}%`;
}

/**
 * Format file size
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return 'N/A';
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format duration (seconds to readable format)
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "2h 30m", "45s")
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return 'N/A';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

/**
 * Format phone number
 * @param phone - Phone number string
 * @returns Formatted phone number (e.g., "(123) 456-7890")
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return 'N/A';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone; // Return as-is if format not recognized
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis
 */
export function truncateText(
  text: string | null | undefined,
  maxLength: number = 50
): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Capitalize first letter of each word
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function capitalizeWords(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format age from date of birth
 * @param dob - Date of birth
 * @returns Age string (e.g., "25 years old")
 */
export function formatAge(dob: string | Date | null | undefined): string {
  if (!dob) return 'N/A';

  const dobDate = typeof dob === 'string' ? new Date(dob) : dob;
  if (isNaN(dobDate.getTime())) return 'Invalid Date';

  const now = new Date();
  let age = now.getFullYear() - dobDate.getFullYear();
  const monthDiff = now.getMonth() - dobDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dobDate.getDate())) {
    age--;
  }

  return age === 1 ? '1 year old' : `${age} years old`;
}

/**
 * Format blood pressure
 * @param systolic - Systolic pressure
 * @param diastolic - Diastolic pressure
 * @returns Formatted blood pressure (e.g., "120/80 mmHg")
 */
export function formatBloodPressure(
  systolic: number | null | undefined,
  diastolic: number | null | undefined
): string {
  if (systolic === null || systolic === undefined || diastolic === null || diastolic === undefined) {
    return 'N/A';
  }
  return `${systolic}/${diastolic} mmHg`;
}

/**
 * Format heart rate
 * @param bpm - Beats per minute
 * @returns Formatted heart rate (e.g., "72 bpm")
 */
export function formatHeartRate(bpm: number | null | undefined): string {
  if (bpm === null || bpm === undefined) return 'N/A';
  return `${bpm} bpm`;
}

/**
 * Format oxygen level
 * @param level - Oxygen saturation level (0-100)
 * @returns Formatted oxygen level (e.g., "98%")
 */
export function formatOxygenLevel(level: number | null | undefined): string {
  if (level === null || level === undefined) return 'N/A';
  return `${level}%`;
}
