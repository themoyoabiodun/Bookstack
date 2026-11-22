import { useQuery } from '@tanstack/react-query';
import { desc, eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db/client';
import { books, type BookStatus } from '@/db/schema';
import { searchBooks } from './open-library';

export type LibraryFilter = 'all' | BookStatus;

/** Books on the shelf, newest first. Re-renders automatically when the table changes. */
export function useBooks(filter: LibraryFilter) {
  const query = db
    .select()
    .from(books)
    .where(filter === 'all' ? undefined : eq(books.status, filter))
    .orderBy(desc(books.createdAt));
  return useLiveQuery(query, [filter]);
}

export function useBook(id: string) {
  return useLiveQuery(db.select().from(books).where(eq(books.id, id)).limit(1), [id]);
}

/** Remote search against Open Library, cached by TanStack Query. */
export function useBookSearch(query: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ['book-search', trimmed],
    queryFn: ({ signal }) => searchBooks(trimmed, signal),
    enabled: trimmed.length >= 2,
    staleTime: 1000 * 60 * 10,
  });
}
