/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const primary = '#1E3A8A';
const secondary = '#10B981';
const accent = '#F59E0B';
const error = '#EF4444';
const success = '#22C55E';
const background = '#F9FAFB';
const card = '#FFFFFF';
const text = '#0F172A';
const mutedText = '#475569';
const border = '#E2E8F0';

export const Colors = {
  light: {
    primary,
    secondary,
    accent,
    error,
    success,
    background,
    card,
    text,
    mutedText,
    border,
    icon: mutedText,
    tint: primary,
    tabIconDefault: mutedText,
    tabIconSelected: primary,
    shadow: 'rgba(15, 23, 42, 0.12)',
  },
  dark: {
    primary: '#93C5FD',
    secondary: '#34D399',
    accent: '#FBBF24',
    error: '#F87171',
    success: '#4ADE80',
    background: '#0F172A',
    card: '#111827',
    text: '#E2E8F0',
    mutedText: '#94A3B8',
    border: '#1F2937',
    icon: '#94A3B8',
    tint: '#93C5FD',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#93C5FD',
    shadow: 'rgba(15, 23, 42, 0.6)',
  },
};

export const Radii = {
  card: 12,
  button: 8,
  input: 8,
  pill: 999,
};

export const Spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
};

export const Typography = {
  header: 26,
  title: 22,
  body: 16,
  small: 14,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
