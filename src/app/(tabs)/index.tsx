import { ScrollView, View } from 'react-native';
import { SafeAreaView } from '@/components/ui/safe-area-view';

import { BookGrid } from '@/components/books/book-grid';
import { EmptyShelf } from '@/components/books/empty-shelf';
import { LibraryHeader } from '@/components/navigation/library-header';
import { TAB_BAR_CLEARANCE } from '@/components/navigation/tab-bar';
import { FilterChips } from '@/components/ui/filter-chips';
import { Text } from '@/components/ui/text';
import { useBooks, type LibraryFilter } from '@/features/books/queries';
import { useLibraryFilter } from '@/stores/library-filter';

const FILTERS: { value: LibraryFilter; label: string }[] = [
  { value: 'all', label: 'All Books' },
  { value: 'reading', label: 'Reading' },
  { value: 'finished', label: 'Finished' },
];

// TODO: replace with the signed-in user's name once accounts are added.
const USER_NAME = 'Guest Reader';

export default function LibraryScreen() {
  const { filter, setFilter } = useLibraryFilter();
  const { data: books } = useBooks(filter);
  const shelfIsEmpty = filter === 'all' && books.length === 0;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-surface">
      <LibraryHeader userName={USER_NAME} />
      <View className="h-14 justify-center px-4">
        <FilterChips options={FILTERS} value={filter} onChange={setFilter} />
      </View>
      <ScrollView
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
