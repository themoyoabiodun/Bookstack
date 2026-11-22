import { create } from 'zustand';

import type { LibraryFilter } from '@/features/books/queries';

type LibraryFilterState = {
  filter: LibraryFilter;
  setFilter: (filter: LibraryFilter) => void;
};

export const useLibraryFilter = create<LibraryFilterState>((set) => ({
  filter: 'all',
  setFilter: (filter) => set({ filter }),
}));
