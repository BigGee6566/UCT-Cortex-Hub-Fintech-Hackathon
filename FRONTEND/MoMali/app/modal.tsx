import { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Switch } from 'react-native';
import { router } from 'expo-router';
import { saveConsent } from '@/services/consent.service';
import type { ConsentState } from '@/types/consent';

export default function ConsentModal() {
  const [scopes, setScopes] = useState<ConsentState['scopes']>({
    balances: true,
    transactions: true,
    income: true,
    debitOrders: false,
  });

  const selectedCount = useMemo(
    () => Object.values(scopes).filter(Boolean).length,
    [scopes]
  );

  async function accept() {
    const consent: ConsentState = {
      accepted: true,
      acceptedAt: new Date().toISOString(),
      scopes,
    };
    await saveConsent(consent);
    router.back();
  }

  async function decline() {
    const consent: ConsentState = {
      accepted: false,
      scopes: { balances: false, transactions: false, income: false, debitOrders: false },
    };
    await saveConsent(consent);
    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect your bank data</Text>
      <Text style={styles.subtitle}>
        Mo’Mali uses your permission to read your data (Open Banking style). You can change this later.
      </Text>

      <View style={styles.card}>
        <Row
          label="Balances"
          value={scopes.balances}
          onChange={(v) => setScopes((s) => ({ ...s, balances: v }))}
        />
        <Row
          label="Transactions"
          value={scopes.transactions}
          onChange={(v) => setScopes((s) => ({ ...s, transactions: v }))}
        />
        <Row
          label="Income / NSFAS patterns"
          value={scopes.income}
          onChange={(v) => setScopes((s) => ({ ...s, income: v }))}
        />
        <Row
          label="Debit orders"
          value={scopes.debitOrders}
          onChange={(v) => setScopes((s) => ({ ...s, debitOrders: v }))}
        />
      </View>

      <Text style={styles.meta}>Selected permissions: {selectedCount} / 4</Text>

      <View style={styles.actions}>
        <Pressable style={[styles.btn, styles.btnGhost]} onPress={decline}>
          <Text style={[styles.btnText, styles.btnTextDark]}>Not now</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnPrimary]} onPress={accept}>
          <Text style={[styles.btnText, styles.btnTextLight]}>Agree & Continue</Text>
        </Pressable>
      </View>
    </View>
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
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', gap: 12 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { opacity: 0.75, lineHeight: 20 },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 14, padding: 14, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLabel: { fontSize: 16, fontWeight: '600' },
  meta: { textAlign: 'center', opacity: 0.7 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  btnGhost: { borderWidth: 1, borderColor: '#111', backgroundColor: 'transparent' },
  btnPrimary: { backgroundColor: '#111' },
  btnText: { fontWeight: '800' },
  btnTextLight: { color: '#fff' },
  btnTextDark: { color: '#111' },
});
