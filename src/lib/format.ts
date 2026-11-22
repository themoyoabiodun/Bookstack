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

/** A readable name from an email address: "ada.quinn@x.com" → "Ada Quinn". */
export function nameFromEmail(email: string) {
  const local = email.split('@')[0] ?? '';
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

/** "just now", "5 min ago", "3 h ago", or a date. */
export function formatRelativeTime(date: Date, now = new Date()) {
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return formatShortDate(date);
}
