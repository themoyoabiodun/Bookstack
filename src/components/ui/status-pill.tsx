import type { BookStatus } from '@/db/schema';
import { cn } from '@/lib/cn';
import { Text } from './text';

export const STATUS_LABEL: Record<BookStatus, string> = {
  reading: 'Reading',
  finished: 'Completed',
};

export function StatusPill({ status }: { status: BookStatus }) {
  const isReading = status === 'reading';
  return (
    <Text
      variant="body-sm-medium"
      className={cn(
        'self-center overflow-hidden rounded-full px-2',
        isReading ? 'bg-warning-bg text-warning' : 'bg-success-bg text-success',
      )}>
      {STATUS_LABEL[status]}
    </Text>
  );
}
