import type { ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';

type IconButtonProps = Omit<PressableProps, 'children'> & {
  children: ReactNode;
  accessibilityLabel: string;
  className?: string;
};

/** 44×44 touch target holding a 20px icon, as in the design's header buttons. */
export function IconButton({ children, className, ...rest }: IconButtonProps) {
  return (
    <Pressable
      hitSlop={4}
      accessibilityRole="button"
      className={cn(
        'size-11 items-center justify-center rounded-full active:opacity-60',
        className,
      )}
      {...rest}>
      {children}
    </Pressable>
  );
}
