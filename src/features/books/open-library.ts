/**
 * Open Library search — free, no API key. https://openlibrary.org/dev/docs/api/search
 */
const SEARCH_URL = 'https://openlibrary.org/search.json';
const FIELDS = 'key,title,author_name,cover_i,number_of_pages_median,isbn';

type SearchDoc = {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
  isbn?: string[];
};

export type BookSearchResult = {
  openLibraryKey: string;
  title: string;
  author: string;
  coverUrl: string | null;
  pageCount: number | null;
  isbn: string | null;
};

export function coverUrlFor(coverId: number | undefined, size: 'S' | 'M' | 'L' = 'L') {
  return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg` : null;
}

export function mapSearchDoc(doc: SearchDoc): BookSearchResult {
  return {
    openLibraryKey: doc.key,
    title: doc.title,
    author: doc.author_name?.join(', ') ?? 'Unknown author',
    coverUrl: coverUrlFor(doc.cover_i),
    pageCount: doc.number_of_pages_median ?? null,
    isbn: doc.isbn?.[0] ?? null,
  };
}

export async function searchBooks(query: string, signal?: AbortSignal) {
  const url = `${SEARCH_URL}?q=${encodeURIComponent(query)}&fields=${FIELDS}&limit=20`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Open Library search failed (${res.status})`);
  const json: { docs: SearchDoc[] } = await res.json();
  return json.docs.map(mapSearchDoc);
}
