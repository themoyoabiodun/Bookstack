import { Image } from 'expo-image';
import { BookOpen } from 'lucide-react-native';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/theme/tokens';

type BookCoverProps = {
  uri: string | null | undefined;
  title: string;
  style?: StyleProp<ViewStyle>;
};

/** Book cover with a neutral placeholder when there's no image. */
export function BookCover({ uri, title, style }: BookCoverProps) {
  return (
    <View
      className="overflow-hidden rounded-sm bg-surface-muted"
      style={style}
      accessible
      accessibilityLabel={`Cover of ${title}`}>
      {uri ? (
        <Image source={{ uri }} style={{ flex: 1 }} contentFit="cover" transition={200} />
      ) : (
        <View className="flex-1 items-center justify-center">
          <BookOpen size={28} color={colors.contentSecondary} />
        </View>
      )}
    </View>
  );
}
