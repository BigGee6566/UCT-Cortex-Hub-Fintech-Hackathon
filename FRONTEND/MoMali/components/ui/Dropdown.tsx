import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, Radii, Spacing } from '@/constants/theme';

export function Dropdown({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <View style={styles.wrap}>
      {options.map((opt) => (
        <Pressable key={opt} onPress={() => onChange(opt)} accessibilityRole="button" style={styles.row}>
          <View style={[styles.radio, value === opt && styles.radioOn]} />
          <Text style={styles.text}>{opt}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
  radio: { width: 16, height: 16, borderRadius: 999, borderWidth: 1, borderColor: Colors.light.border },
  radioOn: { backgroundColor: Colors.light.secondary, borderColor: Colors.light.secondary },
  text: { color: Colors.light.text, fontWeight: '600' },
});
