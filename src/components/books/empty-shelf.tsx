import { router } from 'expo-router';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

/**
 * Fanned stack of placeholder covers, standing in for the "Book ring" artwork in Figma.
 * Swap these for exported illustration assets when they're ready.
 */
const FAN = [
  { w: 41, h: 63, x: -86, y: 23, color: '#8a3b52' },
  { w: 41, h: 63, x: 86, y: 23, color: '#c99a3a' },
  { w: 49, h: 73, x: -68, y: 26, color: '#5b3a6b' },
  { w: 49, h: 73, x: 68, y: 26, color: '#2f5d50' },
  { w: 77, h: 116, x: -45, y: 13, color: '#7a2f45' },
  { w: 77, h: 116, x: 45, y: 13, color: '#d6a03b' },
  { w: 99, h: 148, x: 0, y: 0, color: '#b8431f' },
] as const;

export function EmptyShelf() {
  return (
    <View className="items-center px-6">
      <View className="h-[190px] w-full items-center" accessibilityElementsHidden>
        {FAN.map((cover, i) => (
          <View
            key={i}
            className="absolute rounded-[3px]"
            style={{
              width: cover.w,
              height: cover.h,
              top: 42 + cover.y,
              transform: [{ translateX: cover.x }],
              backgroundColor: cover.color,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
          />
        ))}
      </View>
      <View className="mt-14 gap-2">
        <Text variant="h2" className="text-center text-content-secondary">
          Nothing on the shelf yet.
        </Text>
        <Text variant="body-sm" className="text-center text-content-secondary">
          Add what you’re reading now, or the last book you finished. Either one takes about ten
          seconds.
        </Text>
      </View>
      <Button label="Add a Book" className="mt-8" onPress={() => router.push('/add')} />
    </View>
  );
}
