import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { getConsent } from '@/services/consent.service';
import { getBudgets } from '@/services/budget.service';
import { MOCK_TRANSACTIONS } from '@/services/mockFinance';
import { computeHealthScore } from '@/services/score.service';
import type { ConsentState } from '@/types/consent';
import type { Category } from '@/types/finance';

export default function Dashboard() {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [budgets, setBudgets] = useState<Record<Category, number> | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      setConsent(await getConsent());
      setBudgets(await getBudgets());
    }, 600);

    return () => clearInterval(interval);
  }, []);

  const health = useMemo(() => {
    if (!budgets) return null;
    return computeHealthScore(MOCK_TRANSACTIONS, budgets);
  }, [budgets]);

  const consentLabel =
    consent?.accepted ? 'Consent: Active' : 'Consent: Not connected';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mo’Mali Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{consentLabel}</Text>
        <Text style={styles.cardSub}>
          {consent?.accepted
            ? 'We are using your selected permissions.'
            : 'Connect to unlock smarter insights (mock for now).'}
        </Text>

        <Pressable style={styles.btn} onPress={() => router.push('/modal')}>
          <Text style={styles.btnText}>
            {consent?.accepted ? 'Manage Consent' : 'Connect (Consent)'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Financial Health Score</Text>
        <Text style={styles.score}>{health ? health.score : '...'}/100</Text>

        {health && (
          <Text style={styles.cardSub}>
            Budget: {(health.budgetUtilisation * 100).toFixed(0)}% • Savings: {(health.savingsRate * 100).toFixed(0)}%
          </Text>
        )}

        <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => router.push('/(tabs)/coach')}>
          <Text style={[styles.btnText, styles.btnTextDark]}>Edit Budgets</Text>
        </Pressable>
      </View>

      <View style={styles.tip}>
        <Text style={styles.tipTitle}>Tip</Text>
        <Text style={styles.tipText}>
          If your score is low, start by reducing Data/Airtime and Food overspending.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '900' },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 14, padding: 14, gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '900' },
  cardSub: { opacity: 0.75, lineHeight: 20 },
  score: { fontSize: 34, fontWeight: '900' },
  btn: { marginTop: 6, backgroundColor: '#111', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#111' },
  btnText: { color: '#fff', fontWeight: '900' },
  btnTextDark: { color: '#111' },
  tip: { borderRadius: 14, padding: 14, backgroundColor: '#f3f3f3', gap: 6 },
  tipTitle: { fontWeight: '900' },
  tipText: { opacity: 0.8, lineHeight: 20 },
});
