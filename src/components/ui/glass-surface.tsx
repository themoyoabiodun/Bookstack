import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { View, type ViewProps } from 'react-native';
import { withUniwind } from 'uniwind';

import { cn } from '@/lib/cn';
import { shadows } from '@/theme/tokens';

type GlassSurfaceProps = ViewProps & {
  className?: string;
  size?: 'regular' | 'small';
};

const liquidGlass = isLiquidGlassAvailable();

// GlassView is a third-party native view, so it needs withUniwind to accept className.
const StyledGlassView = withUniwind(GlassView);

/**
 * The frosted "Glass" surface from the design (tab bar, header buttons).
 * Uses native Liquid Glass on iOS 26+, and a translucent white fallback elsewhere.
 */
export function GlassSurface({ className, size = 'regular', style, ...rest }: GlassSurfaceProps) {
  const shadow = size === 'regular' ? shadows.glass : shadows.glassSmall;

  if (liquidGlass) {
    return (
      <StyledGlassView
        glassEffectStyle="regular"
        colorScheme="light"
        isInteractive
        style={[{ overflow: 'hidden' }, style]}
        className={className}
        {...rest}
      />
    );
  }

  return (
    <View
      className={cn('border border-line-glass bg-surface-glass', className)}
      style={[shadow, style]}
      {...rest}
    />
  );
}
