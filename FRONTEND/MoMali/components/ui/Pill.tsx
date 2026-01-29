import { Pressable, Text, StyleSheet } from 'react-native';
import { Colors, Radii, Spacing } from '@/constants/theme';

export function Pill({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={[styles.pill, active && styles.active]}>
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radii.pill,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  active: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  text: { color: Colors.light.text, fontWeight: '600' },
  textActive: { color: Colors.light.card },
});
