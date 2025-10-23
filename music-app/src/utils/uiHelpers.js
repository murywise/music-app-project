// uiHelpers.js
// Last updated: Oct 21, 2025 (fixed the stupid layout bug)
// Just a collection of helpers I use across multiple projects

// I always end up needing these in projects - better to keep them in one place
// than copy-paste them all over the place like I used to do

/**
 * My preferred way to handle class name merging
 * Simpler than classnames package for my needs
 */
export const cn = (...args) => {
  return args
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Format a number with commas
 * 
 * Cuz I always forget the locale stuff syntax
 */
export const formatNumber = (num) => {
  if (!num && num !== 0) return '';
  return num.toLocaleString();
};

/**
 * Basic date formatter - does what I need most of the time
 * 
 * args:
 * - date: Date object or timestamp
 * - showYear: Whether to include year (default: true)
 * - showTime: Whether to include time (default: false)
 */
export const formatDate = (date, showYear = true, showTime = false) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const options = {
    month: 'short',
    day: 'numeric',
  };
  
  if (showYear) {
    options.year = 'numeric';
  }
  
  if (showTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return d.toLocaleDateString('en-US', options);
};

/**
 * Format a relative time (e.g., "2 days ago")
 * Can never remember the Intl.RelativeTimeFormat syntax
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
  } else if (diffDay < 30) {
    return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  } else {
    // Just show the date for older stuff
    return formatDate(date);
  }
};

/**
 * Basic debounce function
 * 
 * Useful for search inputs and resize handlers
 * I've tried lodash but I prefer this simpler version
 * 
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in ms
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Simple throttle function
 * 
 * Useful for scroll handlers
 * Again, I could use lodash but this is simpler
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Truncate text with ellipsis if it exceeds the max length
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

// Gonna add more utils as I need them
// Maybe extract this to a separate npm package later?

// TODO: Add a proper toast notification system
// Current app's notification system is a mess
