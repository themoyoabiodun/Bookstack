import * as Haptics from 'expo-haptics';
import { Pressable, View } from 'react-native';

import { cn } from '@/lib/cn';
import { Text } from './text';

type Option<T extends string> = { value: T; label: string };

type FilterChipsProps<T extends string> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Segmented filter row — "All Books / Reading / Finished". */
export function FilterChips<T extends string>({ options, value, onChange }: FilterChipsProps<T>) {
  return (
    <View className="flex-row" accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => {
              if (selected) return;
              Haptics.selectionAsync();
              onChange(option.value);
            }}
            className={cn('h-8 justify-center rounded-full px-4', selected && 'bg-surface-muted')}>
            <Text
              variant="body-sm-semibold"
              className={selected ? 'text-content' : 'text-content-secondary'}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
