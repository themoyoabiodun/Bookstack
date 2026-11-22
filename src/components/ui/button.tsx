import * as Haptics from 'expo-haptics';
import { Pressable, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';
import { Text } from './text';

type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  size?: 'md' | 'lg';
  tone?: 'primary' | 'secondary';
  className?: string;
};

/** Pill button. Primary is the dark "Add a Book" / "Mark as Finished" style from the design. */
export function Button({
  label,
  size = 'md',
  tone = 'primary',
  className,
  onPress,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
      }}
      className={cn(
        'items-center justify-center rounded-full px-4 active:opacity-80',
        tone === 'primary' ? 'bg-surface-inverse' : 'bg-surface-muted',
        size === 'md' ? 'h-11' : 'h-[54px]',
        disabled && 'opacity-40',
        className,
      )}
      {...rest}>
      <Text
        variant="body-lg-semibold"
        className={tone === 'primary' ? 'text-content-inverse' : 'text-content'}>
        {label}
      </Text>
    </Pressable>
  );
}
