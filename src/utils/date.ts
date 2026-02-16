/**
 * Get today's date string (YYYY-MM-DD) in JST timezone.
 * This ensures correct date even when UTC date differs from JST date.
 */
export const getTodayJST = (): string => {
  const now = new Date();
  // toLocaleDateString with ja-JP and timeZone: 'Asia/Tokyo' gives correct JST date
  const parts = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(now);
  // sv-SE locale formats as YYYY-MM-DD
  return parts;
};

/**
 * Get current month string (YYYY-MM) in JST timezone.
 */
export const getCurrentMonthJST = (): string => {
  return getTodayJST().slice(0, 7);
};
