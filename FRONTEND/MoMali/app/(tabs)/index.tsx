import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getConsent, grantedScopes, type GatedResult } from '@/services/consent.service';
import { getBudgets } from '@/services/budget.service';
import { computeHealthScore } from '@/services/score.service';
import { getTransactions } from '@/services/transactions.service';
import { SCOPE_LABELS, type ConsentState } from '@/types/consent';
import type { Budgets, Transaction } from '@/types/finance';

export default function Dashboard() {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [budgets, setBudgets] = useState<Budgets | null>(null);
  const [transactions, setTransactions] = useState<GatedResult<Transaction[]> | null>(null);
  const [loadError, setLoadError] = useState(false);

  // Refresh when the Dashboard comes into focus (first open, closing the consent
  // modal, returning from Budgets) instead of polling storage every 600 ms.
  useFocusEffect(
    useCallback(() => {
      let active = true; // drop results that arrive after the screen loses focus

      Promise.all([getConsent(), getBudgets(), getTransactions()])
        .then(([nextConsent, nextBudgets, nextTransactions]) => {
          if (!active) return;
          setConsent(nextConsent);
          setBudgets(nextBudgets);
          setTransactions(nextTransactions);
          setLoadError(false);
        })
        .catch(() => {
          if (active) setLoadError(true);
        });

      return () => {
        active = false;
      };
    }, [])
  );

  // The score is computed from transaction history, so it needs transactions:read.
  const health = useMemo(() => {
    if (!budgets || transactions?.status !== 'ok') return null;
    return computeHealthScore(transactions.data, budgets);
  }, [budgets, transactions]);

  const shared = consent ? grantedScopes(consent).map((s) => SCOPE_LABELS[s]) : [];
  const consentActive = shared.length > 0;
  const consentLabel = consentActive ? 'Consent: Active' : 'Consent: Not connected';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mo’Mali Dashboard</Text>

      {loadError ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          We couldn’t load your data. Your data is safe — please try again.
        </Text>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{consentLabel}</Text>
        <Text style={styles.cardSub}>
          {consentActive
            ? `Sharing: ${shared.join(', ')}. You can change or revoke this anytime.`
            : 'Connect to unlock smarter insights (mock for now).'}
        </Text>

        <Pressable style={styles.btn} accessibilityRole="button" onPress={() => router.push('/modal')}>
          <Text style={styles.btnText}>{consentActive ? 'Manage Consent' : 'Connect (Consent)'}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Financial Health Score</Text>

        {transactions?.status === 'consent-required' ? (
          <Text style={styles.cardSub}>
            Allow Transactions access to see your score. It is calculated from your spending.
          </Text>
        ) : (
          <>
            <Text style={styles.score}>{health ? health.score : '...'}/100</Text>
            {health && (
              <Text style={styles.cardSub}>
                Budget: {(health.budgetUtilisation * 100).toFixed(0)}% • Savings: {(health.savingsRate * 100).toFixed(0)}%
              </Text>
            )}
          </>
        )}

        <Pressable
          style={[styles.btn, styles.btnGhost]}
          accessibilityRole="button"
          onPress={() => router.navigate('/(tabs)/budgets')}>
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
  error: { color: '#B3261E', fontWeight: '700' },
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
