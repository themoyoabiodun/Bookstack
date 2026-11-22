import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronLeft, Pencil, Share as ShareIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';
import { SafeAreaView } from '@/components/ui/safe-area-view';

import { BookCover } from '@/components/books/book-cover';
import { ProgressBar } from '@/components/books/progress-bar';
import { HeaderActionGroup } from '@/components/navigation/library-header';
import { Button } from '@/components/ui/button';
import { GlassSurface } from '@/components/ui/glass-surface';
import { IconButton } from '@/components/ui/icon-button';
import { STATUS_LABEL, StatusPill } from '@/components/ui/status-pill';
import { Text } from '@/components/ui/text';
import { BOOK_STATUSES, type BookStatus } from '@/db/schema';
import { setBookStatus } from '@/features/books/mutations';
import { useBook } from '@/features/books/queries';
import { cn } from '@/lib/cn';
import { formatShortDate, progressPercent } from '@/lib/format';
import { colors, shadows } from '@/theme/tokens';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useBook(id);
  const book = data[0];
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  if (!book) return <SafeAreaView className="flex-1 bg-surface" />;

  const finished = book.status === 'finished';
  const percent = finished ? 100 : progressPercent(book.pagesRead, book.pageCount);

  const chooseStatus = async (status: BookStatus) => {
    setStatusMenuOpen(false);
    if (status === book.status) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setBookStatus(book.id, status);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="h-[78px] flex-row items-center justify-between px-4">
        <GlassSurface size="small" className="rounded-full">
          <IconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ChevronLeft size={20} color={colors.content} />
          </IconButton>
        </GlassSurface>
        <HeaderActionGroup>
          <IconButton accessibilityLabel="Edit book">
            <Pencil size={20} color={colors.content} />
          </IconButton>
          <IconButton
            accessibilityLabel="Share book"
            onPress={() => Share.share({ message: `${book.title} by ${book.author}` })}>
            <ShareIcon size={20} color={colors.content} />
          </IconButton>
        </HeaderActionGroup>
      </View>

      <ScrollView contentContainerClassName="px-4 pt-4 pb-8">
        <Pressable
          onPress={() => setStatusMenuOpen((open) => !open)}
          accessibilityRole="button"
          accessibilityLabel={`Status: ${STATUS_LABEL[book.status]}. Change status`}>
          <StatusPill status={book.status} />
        </Pressable>
        <Text variant="h2" className="mt-2 text-center">
          {book.title}
        </Text>
        <Text variant="body-sm-medium" className="mt-2 text-center text-content-secondary">
          {book.author}
        </Text>

        <View className="mt-7 w-[208px] self-center">
          <BookCover uri={book.coverUrl} title={book.title} style={{ width: 208, height: 256 }} />
          <View className="mt-4 flex-row items-center gap-3">
            <ProgressBar percent={percent} complete={finished} className="flex-1" />
            <Text
              variant="caption"
              className="overflow-hidden rounded-full bg-surface-subtle px-[7px] py-px">
              {percent}%
            </Text>
          </View>
        </View>

        {statusMenuOpen && (
          <View
            className="absolute top-[190px] right-4 left-[71px] overflow-hidden rounded-2xl bg-surface-subtle"
            style={shadows.glass}>
            {BOOK_STATUSES.map((status) => (
              <Pressable
                key={status}
                onPress={() => chooseStatus(status)}
                accessibilityRole="menuitem"
                className="h-12 flex-row items-center justify-between px-3 active:bg-surface-muted">
                <Text variant="body-lg-medium">{STATUS_LABEL[status]}</Text>
                <View
                  className={cn(
                    'size-4 items-center justify-center rounded-full',
                    status === book.status ? 'bg-content' : 'border border-content-secondary',
                  )}>
                  {status === book.status && <Check size={10} color="#fff" strokeWidth={3} />}
                </View>
              </Pressable>
            ))}
          </View>
        )}

        <View className="mt-7 overflow-hidden rounded-2xl bg-surface-subtle">
          <InfoRow label="Pages read">
            <Text variant="body-lg-semibold">
              {book.pagesRead}
              <Text variant="body-lg-medium" className="text-content-secondary">
                {' / '}
                {book.pageCount ?? '—'}
              </Text>
            </Text>
          </InfoRow>
          {book.startedAt && <InfoRow label="Started" value={formatShortDate(book.startedAt)} />}
          {book.finishedAt && (
            <InfoRow label="Completed" value={formatShortDate(book.finishedAt)} />
          )}
        </View>
      </ScrollView>

      {!finished && (
        <View className="px-4 pt-4 pb-2">
          <Button label="Mark as Finished" size="lg" onPress={() => chooseStatus('finished')} />
        </View>
      )}
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <View className="h-12 flex-row items-center justify-between px-3">
      <Text variant="body-lg-medium" className="text-content-secondary">
        {label}
      </Text>
      <View className="rounded-md bg-surface-muted px-1.5">
        {children ?? <Text variant="body-lg-semibold">{value}</Text>}
      </View>
    </View>
  );
}
