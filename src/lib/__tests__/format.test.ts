import {
  formatRelativeTime,
  formatShortDate,
  initials,
  nameFromEmail,
  progressPercent,
} from '../format';

describe('formatShortDate', () => {
  it('matches the design format', () => {
    expect(formatShortDate(new Date(2026, 7, 17))).toBe('17 Aug. 2026');
    expect(formatShortDate(new Date(2026, 4, 3))).toBe('3 May 2026');
  });
});

describe('progressPercent', () => {
  it('rounds and clamps', () => {
    expect(progressPercent(33, 452)).toBe(7);
    expect(progressPercent(500, 452)).toBe(100);
    expect(progressPercent(-5, 100)).toBe(0);
  });

  it('returns 0 when page count is unknown', () => {
    expect(progressPercent(10, null)).toBe(0);
    expect(progressPercent(10, 0)).toBe(0);
  });
});

describe('initials', () => {
  it('uses first and last name', () => {
    expect(initials('Ada Mary Quinn')).toBe('AQ');
    expect(initials('  reader ')).toBe('RE');
    expect(initials('')).toBe('');
  });
});

describe('nameFromEmail', () => {
  it('turns the local part into a name', () => {
    expect(nameFromEmail('ada.quinn@example.com')).toBe('Ada Quinn');
    expect(nameFromEmail('reader_42@example.com')).toBe('Reader 42');
  });
});

describe('formatRelativeTime', () => {
  const now = new Date(2026, 10, 22, 12, 0);
  it('describes recent times', () => {
    expect(formatRelativeTime(new Date(2026, 10, 22, 11, 59, 40), now)).toBe('just now');
    expect(formatRelativeTime(new Date(2026, 10, 22, 11, 55), now)).toBe('5 min ago');
    expect(formatRelativeTime(new Date(2026, 10, 22, 9, 0), now)).toBe('3 h ago');
    expect(formatRelativeTime(new Date(2026, 10, 20, 9, 0), now)).toBe('20 Nov. 2026');
  });
});
