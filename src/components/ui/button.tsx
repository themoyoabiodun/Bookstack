import * as Haptics from 'expo-haptics';
import { Pressable, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';
import { Text } from './text';

type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  size?: 'md' | 'lg';
  className?: string;
};

/** Dark pill button — "Add a Book" (md) and "Mark as Finished" (lg) in the design. */
export function Button({ label, size = 'md', className, onPress, disabled, ...rest }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
      }}
      className={cn(
        'items-center justify-center rounded-full bg-surface-inverse px-4 active:opacity-80',
        size === 'md' ? 'h-11' : 'h-[54px]',
        disabled && 'opacity-40',
        className,
      )}
      {...rest}>
      <Text variant="body-lg-semibold" className="text-content-inverse">
        {label}
      </Text>
    </Pressable>
  );
}
