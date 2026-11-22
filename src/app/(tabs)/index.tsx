import { useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

import { BookGrid } from '@/components/books/book-grid';
import { EmptyShelf } from '@/components/books/empty-shelf';
import { LibraryHeader } from '@/components/navigation/library-header';
import { TAB_BAR_CLEARANCE } from '@/components/navigation/tab-bar';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { FilterChips } from '@/components/ui/filter-chips';
import { Text } from '@/components/ui/text';
import { useDisplayName } from '@/features/auth/use-display-name';
import { useSession } from '@/features/auth/session-store';
import { useBooks, type LibraryFilter } from '@/features/books/queries';
import { syncNow } from '@/features/sync/engine';
import { useLibraryFilter } from '@/stores/library-filter';

const FILTERS: { value: LibraryFilter; label: string }[] = [
  { value: 'all', label: 'All Books' },
  { value: 'reading', label: 'Reading' },
  { value: 'finished', label: 'Finished' },
];

export default function LibraryScreen() {
  const { filter, setFilter } = useLibraryFilter();
  const { data: books } = useBooks(filter);
  const shelfIsEmpty = filter === 'all' && books.length === 0;
  const userName = useDisplayName();
  const signedIn = useSession() !== null;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await syncNow();
    setRefreshing(false);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-surface">
      <LibraryHeader userName={userName} />
      <View className="h-14 justify-center px-4">
        <FilterChips options={FILTERS} value={filter} onChange={setFilter} />
      </View>
      <ScrollView
        refreshControl={
          signedIn ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined
        }
        contentContainerClassName="pt-7"
        contentContainerStyle={{ paddingBottom: TAB_BAR_CLEARANCE, flexGrow: 1 }}>
        {shelfIsEmpty ? (
          <EmptyShelf />
        ) : books.length === 0 ? (
          <Text className="mt-16 text-center text-content-secondary">
            {filter === 'reading'
              ? 'You’re not reading anything right now.'
              : 'No finished books yet.'}
          </Text>
        ) : (
          <BookGrid books={books} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
