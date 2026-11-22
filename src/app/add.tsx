import { router } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from '@/components/ui/safe-area-view';

import { BookCover } from '@/components/books/book-cover';
import { IconButton } from '@/components/ui/icon-button';
import { Text } from '@/components/ui/text';
import { addBook } from '@/features/books/mutations';
import type { BookSearchResult } from '@/features/books/open-library';
import { useBookSearch } from '@/features/books/queries';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { colors } from '@/theme/tokens';

/** Search Open Library and add a book to the shelf. */
export default function AddBookScreen() {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 350);
  const { data, isFetching, isError } = useBookSearch(debounced);

  const onPick = async (result: BookSearchResult) => {
    const id = await addBook(result);
    router.dismiss();
    router.push({ pathname: '/book/[id]', params: { id } });
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-surface">
      <View className="flex-row items-center justify-between px-4 pt-2">
        <Text variant="h2">Add a Book</Text>
        <IconButton accessibilityLabel="Close" onPress={() => router.back()}>
          <X size={22} color={colors.content} />
        </IconButton>
      </View>

      <View className="mx-4 mt-4 h-12 flex-row items-center gap-2 rounded-full bg-surface-subtle px-4">
        <Search size={18} color={colors.contentSecondary} />
        <TextInput
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder="Title, author or ISBN"
          placeholderTextColor={colors.contentSecondary}
          returnKeyType="search"
          className="flex-1 font-body text-body-lg text-content"
        />
        {isFetching && <ActivityIndicator size="small" color={colors.contentSecondary} />}
      </View>

      {isError && (
        <Text className="mt-6 px-4 text-center text-content-secondary">
          Search isn’t available right now. Check your connection and try again.
        </Text>
      )}

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.openLibraryKey}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="px-4 py-4"
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onPick(item)}
            accessibilityRole="button"
            accessibilityLabel={`Add ${item.title} by ${item.author}`}
            className="flex-row items-center gap-3 rounded-xl p-1 active:bg-surface-subtle">
            <BookCover uri={item.coverUrl} title={item.title} style={{ width: 48, height: 72 }} />
            <View className="flex-1">
              <Text variant="body-lg-semibold" numberOfLines={2}>
                {item.title}
              </Text>
              <Text className="text-content-secondary" numberOfLines={1}>
                {item.author}
                {item.pageCount ? ` · ${item.pageCount} pages` : ''}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
