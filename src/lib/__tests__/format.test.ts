import { formatShortDate, initials, progressPercent } from '../format';

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
