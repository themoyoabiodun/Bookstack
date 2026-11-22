import { SafeAreaView as BaseSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

/**
 * Safe-area screen container that accepts `className`.
 * Uniwind only styles React Native's own components; third-party ones need withUniwind,
 * otherwise their classes are silently ignored.
 */
export const SafeAreaView = withUniwind(BaseSafeAreaView);
