import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors, Radii, Spacing, Typography } from '@/constants/theme';

export default function BankConnectionScreen() {
  async function connectMock() {
    // MVP: simulate successful connection
    router.push('/bank-providers');
  }
  function skipToDashboard() {
    router.replace('/(tabs)/index');
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Link your bank account</Text>
        <Text style={styles.sub}>
          Connect securely (read-only). This lets MoMali calculate budgets, detect overspending,
          and generate your financial health score.
        </Text>

        <Pressable style={styles.btn} onPress={connectMock} accessibilityRole="button">
          <Text style={styles.btnText}>Connect Bank</Text>
        </Pressable>

      <Pressable style={[styles.btn, styles.ghost]} onPress={skipToDashboard} accessibilityRole="button">
        <Text style={[styles.btnText, styles.dark]}>Skip for now</Text>
      </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    padding: Spacing.lg,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  title: { fontSize: Typography.title, fontWeight: '800', color: Colors.light.text },
  sub: { color: Colors.light.mutedText, lineHeight: 20, fontWeight: '600', fontSize: Typography.body },
  btn: {
    backgroundColor: '#0E1A33',
    paddingVertical: Spacing.sm,
    borderRadius: Radii.button,
    alignItems: 'center',
    marginTop: Spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
  },
  btnText: { color: Colors.light.card, fontWeight: '800' },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.light.primary },
  dark: { color: Colors.light.primary },
});
