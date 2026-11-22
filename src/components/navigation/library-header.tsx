import { Link } from 'expo-router';
import { Bell, Search, Sparkles, UserRound } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { GlassSurface } from '@/components/ui/glass-surface';
import { IconButton } from '@/components/ui/icon-button';
import { Text } from '@/components/ui/text';
import { initials } from '@/lib/format';
import { colors } from '@/theme/tokens';

/**
 * Top bar on Library: avatar + sparkles on the left, search | notifications on the right.
 * The avatar opens the account screen. Signed out, it shows a person icon.
 */
export function LibraryHeader({ userName }: { userName: string | null }) {
  return (
    <View className="h-[78px] flex-row items-center justify-between px-4">
      <View className="flex-row items-center gap-4">
        <Link href="/account" asChild>
          <Pressable
            className="size-11 items-center justify-center rounded-full bg-brand active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel={userName ? `Account, ${userName}` : 'Sign in to sync'}>
            {userName ? (
              <Text variant="body-lg-semibold" className="text-brand-on">
                {initials(userName)}
              </Text>
            ) : (
              <UserRound size={22} color={colors.brandOn} />
            )}
          </Pressable>
        </Link>
        <GlassSurface size="small" className="rounded-full">
          <IconButton accessibilityLabel="Recommendations">
            <Sparkles size={20} color={colors.content} />
          </IconButton>
        </GlassSurface>
      </View>
      <HeaderActionGroup>
        <IconButton accessibilityLabel="Search your shelf">
          <Search size={20} color={colors.content} />
        </IconButton>
        <IconButton accessibilityLabel="Notifications">
          <Bell size={20} color={colors.content} />
        </IconButton>
      </HeaderActionGroup>
    </View>
  );
}

/** Two icon buttons in one glass pill, split by a hairline — used on every header in the design. */
export function HeaderActionGroup({ children }: { children: [React.ReactNode, React.ReactNode] }) {
  return (
    <GlassSurface size="small" className="flex-row items-center rounded-full p-px">
      {children[0]}
      <View className="mx-[1px] h-8 w-px bg-line" />
      {children[1]}
    </GlassSurface>
  );
}
