import { View } from 'react-native';

import { cn } from '@/lib/cn';

type ProgressBarProps = {
  percent: number;
  /** Finished books show a green bar in the design. */
  complete?: boolean;
  className?: string;
};

export function ProgressBar({ percent, complete, className }: ProgressBarProps) {
  return (
    <View
      className={cn('h-[7px] overflow-hidden rounded-full bg-surface-muted', className)}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percent }}>
      <View
        className={cn('h-full rounded-full', complete ? 'bg-success' : 'bg-content-secondary')}
        style={{ width: `${Math.max(percent, 6)}%` }}
      />
    </View>
  );
}
