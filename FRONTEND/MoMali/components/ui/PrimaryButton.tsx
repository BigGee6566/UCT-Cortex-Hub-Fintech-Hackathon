import { Pressable, Text, StyleSheet } from 'react-native';
import { Colors, Radii, Spacing, Typography } from '@/constants/theme';

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.btn, variant === 'ghost' && styles.ghost]}
    >
      <Text style={[styles.text, variant === 'ghost' && styles.ghostText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.button,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  text: { color: Colors.light.card, fontWeight: '800', fontSize: Typography.body },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.light.primary },
  ghostText: { color: Colors.light.primary },
});
