import { useState } from 'react';
import { View, Text, StyleSheet, Switch, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { saveConsent } from '@/services/consent.service';
import { Colors, Radii, Spacing, Typography } from '@/constants/theme';


export default function ConsentScreen() {
  const [balances, setBalances] = useState(true);
  const [transactions, setTransactions] = useState(true);
  const [income, setIncome] = useState(true);
  const [debitOrders, setDebitOrders] = useState(false);

  async function onContinue() {
    await saveConsent({
      accepted: true,
      acceptedAt: new Date().toISOString(),
      scopes: { balances, transactions, income, debitOrders },
    });

    // next = bank connection screen
    router.replace('/(auth)/bank-connection');
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Confirm access</Text>
        <Text style={styles.sub}>
          Mo'Mali requests read-only access to power budgeting, insights, and your health score.
          You can revoke anytime.
        </Text>

        <View style={styles.card}>
          <Row label="Balances" value={balances} onChange={setBalances} />
          <Row label="Transactions" value={transactions} onChange={setTransactions} />
          <Row label="Income / NSFAS patterns" value={income} onChange={setIncome} />
          <Row label="Debit orders" value={debitOrders} onChange={setDebitOrders} />
        </View>

        <Pressable style={styles.btn} onPress={onContinue} accessibilityRole="button">
          <Text style={styles.btnText}>Agree & Continue</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Row({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowText}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
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
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.md,
    gap: Spacing.xs,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
  rowText: { fontWeight: '700', color: Colors.light.text },
  btn: {
     backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.button,
    alignItems: 'center',
    marginTop: Spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
  },
  btnText: { color: Colors.light.onAccent, fontWeight: '800' },
});
