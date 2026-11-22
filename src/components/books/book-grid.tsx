import { Link } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Pressable, View, useWindowDimensions } from 'react-native';

import type { Book } from '@/db/schema';
import { progressPercent } from '@/lib/format';
import { BookCover } from './book-cover';
import { ProgressBar } from './progress-bar';

const COLUMNS = 3;
const GUTTER = 16; // screen padding
const GAP = 16;
const COVER_RATIO = 158 / 108.67; // from the design

/** Three-column shelf of covers with a progress bar under each. */
export function BookGrid({ books }: { books: Book[] }) {
  const { width } = useWindowDimensions();
  const itemWidth = (width - GUTTER * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

  return (
    <View className="flex-row flex-wrap px-4" style={{ gap: GAP, rowGap: 24 }}>
      {books.map((book) => {
        const finished = book.status === 'finished';
        return (
          <Link key={book.id} href={{ pathname: '/book/[id]', params: { id: book.id } }} asChild>
            <Pressable
              style={{ width: itemWidth }}
              className="gap-3 active:opacity-80"
              accessibilityLabel={`${book.title} by ${book.author}`}>
              <View>
                <BookCover
                  uri={book.coverUrl}
                  title={book.title}
                  style={{ width: itemWidth, height: itemWidth * COVER_RATIO }}
                />
                {finished && (
                  <View className="absolute right-2 bottom-2 size-5 items-center justify-center rounded-full bg-black/40">
                    <Check size={12} color="#fff" strokeWidth={3} />
                  </View>
                )}
              </View>
              <ProgressBar
                percent={finished ? 100 : progressPercent(book.pagesRead, book.pageCount)}
                complete={finished}
              />
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}
