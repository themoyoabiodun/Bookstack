const MONTHS = [
  'Jan.',
  'Feb.',
  'Mar.',
  'Apr.',
  'May',
  'Jun.',
  'Jul.',
  'Aug.',
  'Sep.',
  'Oct.',
  'Nov.',
  'Dec.',
];

/** Formats a date the way the design shows it: "17 Aug. 2026". */
export function formatShortDate(date: Date) {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** Reading progress as a whole percentage, clamped to 0–100. */
export function progressPercent(pagesRead: number, pageCount: number | null | undefined) {
  if (!pageCount || pageCount <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((pagesRead / pageCount) * 100)));
}

/** Two-letter initials for the avatar, e.g. "Ada Quinn" → "AQ". */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
