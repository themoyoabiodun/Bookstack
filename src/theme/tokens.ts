/**
 * Raw design tokens for places that can't take a className (icon colors, native props).
 * Mirrors the @theme block in src/global.css — change both together.
 */
export const colors = {
  brand: '#31705e',
  brandOn: '#befe1a',
  content: '#353535',
  contentSecondary: '#777777',
  contentInverse: '#ffffff',
  surface: '#ffffff',
  surfaceSubtle: '#f6f6f6',
  surfaceMuted: '#e9e9e9',
  surfaceInverse: '#353535',
  success: '#007a1f',
  warning: '#a85300',
} as const;

/** Figma "Glass/Regular" and "Glass/Small" drop shadows. */
export const shadows = {
  glass: { boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)' },
  glassSmall: { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.10)' },
} as const;
