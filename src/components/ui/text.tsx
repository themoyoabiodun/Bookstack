import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { cn } from '@/lib/cn';

/** Type styles from the Figma text styles. */
const variants = {
  h2: 'font-body-semibold text-h2',
  'body-lg-semibold': 'font-body-semibold text-body-lg tracking-[0.1px]',
  'body-lg-medium': 'font-body-medium text-body-lg tracking-[0.1px]',
  'body-sm': 'font-body text-body-sm tracking-[0.1px]',
  'body-sm-medium': 'font-body-medium text-body-sm tracking-[0.1px]',
  'body-sm-semibold': 'font-body-semibold text-body-sm tracking-[0.1px]',
  caption: 'font-caption text-caption tracking-[0.1px]',
} as const;

export type TextVariant = keyof typeof variants;

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  className?: string;
};

export function Text({ variant = 'body-sm', className, ...rest }: TextProps) {
  return <RNText className={cn('text-content', variants[variant], className)} {...rest} />;
}
