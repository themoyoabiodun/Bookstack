import { View } from 'react-native';
import { SafeAreaView } from '@/components/ui/safe-area-view';

import { Text } from '@/components/ui/text';
import { useBooks } from '@/features/books/queries';

/** Placeholder until the Stats screen is designed. */
export default function StatsScreen() {
  const { data: books } = useBooks('all');
  const finished = books.filter((b) => b.status === 'finished').length;
  const reading = books.length - finished;
  const pages = books.reduce((sum, b) => sum + b.pagesRead, 0);

  const stats = [
    { label: 'Finished', value: finished },
    { label: 'Reading', value: reading },
    { label: 'Pages read', value: pages },
  ];

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-surface px-4">
      <Text variant="h2" className="mt-6">
        Stats
      </Text>
      <View className="mt-6 overflow-hidden rounded-2xl bg-surface-subtle">
        {stats.map((s) => (
          <View key={s.label} className="h-12 flex-row items-center justify-between px-3">
            <Text variant="body-lg-medium" className="text-content-secondary">
              {s.label}
            </Text>
            <Text variant="body-lg-semibold">{s.value}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}
