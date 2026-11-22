import type { Book } from '@/db/schema';
import {
  fromRemote,
  nextUpdatedAt,
  parseTimestamp,
  shouldApplyRemote,
  toRemote,
  type RemoteBook,
} from '../remote-book';

const book: Book = {
  id: 'b1',
  title: 'Purple Hibiscus',
  author: 'Chimamanda Ngozi Adichie',
  coverUrl: null,
  pageCount: 307,
  pagesRead: 33,
  status: 'reading',
  openLibraryKey: '/works/OL1W',
  isbn: null,
  startedAt: new Date('2026-08-17T09:00:00.000Z'),
  finishedAt: null,
  createdAt: new Date('2026-08-17T09:00:00.000Z'),
  updatedAt: new Date('2026-08-18T10:30:00.250Z'),
  deletedAt: null,
  dirty: true,
};

const remote = (updatedAt: string): RemoteBook => ({
  ...toRemote(book, 'user-1'),
  updated_at: updatedAt,
  server_updated_at: '2026-08-18T10:30:01.123456+00:00',
});

describe('parseTimestamp', () => {
  it('handles Postgres microsecond timestamps', () => {
    expect(parseTimestamp('2026-08-18T10:30:00.250123+00:00').toISOString()).toBe(
      '2026-08-18T10:30:00.250Z',
    );
    expect(parseTimestamp('2026-08-18T10:30:00+00:00').toISOString()).toBe(
      '2026-08-18T10:30:00.000Z',
    );
  });
});

describe('toRemote / fromRemote', () => {
  it('round-trips a book and marks it clean', () => {
    const back = fromRemote(remote(book.updatedAt.toISOString()));
    expect(back).toEqual({ ...book, dirty: false });
  });

  it('sends the user id and no server-owned fields', () => {
    const row = toRemote(book, 'user-1');
    expect(row.user_id).toBe('user-1');
    expect(row).not.toHaveProperty('server_updated_at');
  });
});

describe('shouldApplyRemote (last write wins)', () => {
  it('applies rows we do not have', () => {
    expect(shouldApplyRemote(undefined, remote('2020-01-01T00:00:00Z'))).toBe(true);
  });

  it('applies strictly newer rows only', () => {
    const local = { updatedAt: book.updatedAt };
    expect(shouldApplyRemote(local, remote('2026-08-18T10:30:00.251+00:00'))).toBe(true);
    expect(shouldApplyRemote(local, remote('2026-08-18T10:30:00.250+00:00'))).toBe(false);
    expect(shouldApplyRemote(local, remote('2026-08-18T10:29:00+00:00'))).toBe(false);
  });
});

describe('nextUpdatedAt', () => {
  it('uses the current time normally', () => {
    const now = new Date('2026-09-01T00:00:00Z');
    expect(nextUpdatedAt(book.updatedAt, now)).toEqual(now);
  });

  it('never goes backwards when the device clock is behind', () => {
    const behind = new Date('2026-01-01T00:00:00Z');
    expect(nextUpdatedAt(book.updatedAt, behind).getTime()).toBe(book.updatedAt.getTime() + 1);
  });
});
