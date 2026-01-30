/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const primary = '#2EC4B6';
const secondary = '#4FD1C5';
const accent = '#2EC4B6';
const mint = '#E6FFFA';
const error = '#FF6B6B';
const success = '#2EC4B6';
const background = '#0E1A33';
const card = '#1B2A4A';
const surfaceAlt = '#2A3A5E';
const text = '#F5F7FA';
const mutedText = '#B8C2E0';
const border = '#3B4A6B';
const onAccent = '#0E1A33';

export const Colors = {
  light: {
    primary,
    secondary,
    accent,
    error,
    success,
    mint,
    background,
    card,
    surfaceAlt,
    text,
    mutedText,
    border,
    onAccent,
    icon: mutedText,
    tint: primary,
    tabIconDefault: mutedText,
    tabIconSelected: primary,
    shadow: 'rgba(15, 23, 42, 0.12)',
  },
  dark: {
    primary: '#2EC4B6',
    secondary: '#4FD1C5',
    accent: '#2EC4B6',
    error: '#FF6B6B',
    success: '#2EC4B6',
    mint: '#E6FFFA',
    background: '#0E1A33',
    card: '#1B2A4A',
    surfaceAlt: '#2A3A5E',
    text: '#F5F7FA',
    mutedText: '#B8C2E0',
    border: '#3B4A6B',
    onAccent: '#0E1A33',
    icon: '#B8C2E0',
    tint: '#2EC4B6',
    tabIconDefault: '#B8C2E0',
    tabIconSelected: '#2EC4B6',
    shadow: 'rgba(14, 26, 51, 0.6)',
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
