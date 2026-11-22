import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import type { Tabs } from 'expo-router/js-tabs';
import { Book, ChartColumn, Plus, type LucideIcon } from 'lucide-react-native';
import type { ComponentProps } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/ui/glass-surface';
import { colors } from '@/theme/tokens';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  index: { icon: Book, label: 'Library' },
  stats: { icon: ChartColumn, label: 'Stats' },
};

/** Floating glass tab bar: Library · Add · Stats. "Add" opens a modal rather than a tab. */
export function TabBar({ state, emitter, navigateToTab }: TabBarProps) {
  const insets = useSafeAreaInsets();

  const renderTab = (routeName: string) => {
    const index = state.routes.findIndex((r) => r.name === routeName);
    const route = state.routes[index];
    const { icon: Icon, label } = ICONS[routeName];
    const focused = state.index === index;

    return (
      <Pressable
        key={route.key}
        accessibilityRole="tab"
        accessibilityLabel={label}
        accessibilityState={{ selected: focused }}
        onPress={() => {
          const event = emitter.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            Haptics.selectionAsync();
            navigateToTab(route.key);
          }
        }}
        className="size-11 items-center justify-center rounded-full active:opacity-60">
        <Icon
          size={24}
          color={focused ? colors.content : colors.contentSecondary}
          fill={focused ? colors.content : 'transparent'}
          strokeWidth={focused ? 1.5 : 2}
        />
      </Pressable>
    );
  };

  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-0 bottom-0 items-center"
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
      <GlassSurface className="h-[66px] w-[223px] flex-row items-center justify-between rounded-full px-[13px]">
        {renderTab('index')}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add a book"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/add');
          }}
          className="size-11 items-center justify-center rounded-full active:opacity-60">
          <Plus size={24} color={colors.content} />
        </Pressable>
        {renderTab('stats')}
      </GlassSurface>
    </View>
  );
}

/** Space to leave under scrolling content so the floating bar never covers it. */
export const TAB_BAR_CLEARANCE = 112;
