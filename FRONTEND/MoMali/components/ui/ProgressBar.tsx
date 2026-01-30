import { View, StyleSheet } from 'react-native';

import { Colors, Radii } from '@/constants/theme';

export function ProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.round(clamped * 100)}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: Radii.pill,
    backgroundColor: Colors.light.border,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: Radii.pill,
    backgroundColor: Colors.light.secondary,
  },
});