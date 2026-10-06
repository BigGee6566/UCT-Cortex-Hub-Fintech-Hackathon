import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import type { GatedResult } from '@/services/consent.service';
import { getTransactions } from '@/services/transactions.service';
import type { Transaction } from '@/types/finance';

type Filter = 'All' | 'Income' | 'Expenses';

export default function Transactions() {
  const [filter, setFilter] = useState<Filter>('All');
  const [result, setResult] = useState<GatedResult<Transaction[]> | null>(null);

  // Re-check on focus: consent may have changed in the consent modal.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      getTransactions().then((next) => {
        if (active) setResult(next);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  const all = useMemo(() => (result?.status === 'ok' ? result.data : []), [result]);

  const data = useMemo(() => {
    if (filter === 'Income') return all.filter((t) => t.amount > 0);
    if (filter === 'Expenses') return all.filter((t) => t.amount < 0);
    return all;
  }, [all, filter]);

  const totals = useMemo(() => {
    const income = all.filter((t) => t.amount > 0).reduce((a, b) => a + b.amount, 0);
    const expenses = all.filter((t) => t.amount < 0).reduce((a, b) => a + Math.abs(b.amount), 0);
    return { income, expenses };
  }, [all]);

  if (result?.status === 'consent-required') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Transactions</Text>
        <View style={styles.locked}>
          <Text style={styles.lockedTitle}>Transactions access is off</Text>
          <Text style={styles.lockedText}>
            Allow Mo’Mali to read your transactions to see your income and spending here.
          </Text>
          <Pressable style={styles.lockedButton} accessibilityRole="button" onPress={() => router.push('/modal')}>
            <Text style={styles.lockedButtonText}>Allow access</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions</Text>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>Income: R {totals.income.toFixed(0)}</Text>
        <Text style={styles.summaryText}>Expenses: R {totals.expenses.toFixed(0)}</Text>
      </View>

      <View style={styles.filters}>
        {(['All', 'Income', 'Expenses'] as Filter[]).map((f) => (
          <Pressable
            key={f}
            style={[styles.pill, filter === f && styles.pillActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.pillText, filter === f && styles.pillTextActive]}>{f}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 18 }}
        renderItem={({ item }) => <TxRow tx={item} />}
        ListEmptyComponent={result === null ? <Text style={styles.rowMeta}>Loading transactions…</Text> : null}
      />
    </View>
  );
}

function TxRow({ tx }: { tx: Transaction }) {
  const isIncome = tx.amount > 0;
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{tx.description}</Text>
        <Text style={styles.rowMeta}>
          {tx.date} • {tx.category}{tx.merchant ? ` • ${tx.merchant}` : ''}
        </Text>
      </View>
      <Text style={[styles.amount, isIncome ? styles.income : styles.expense]}>
        {isIncome ? '+' : '-'}R {Math.abs(tx.amount).toFixed(0)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  title: { fontSize: 22, fontWeight: '800' },
  summary: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryText: { fontWeight: '700', opacity: 0.8 },
  filters: { flexDirection: 'row', gap: 8 },
  pill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: '#ccc' },
  pillActive: { backgroundColor: '#111', borderColor: '#111' },
  pillText: { fontWeight: '700' },
  pillTextActive: { color: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowTitle: { fontWeight: '800' },
  rowMeta: { opacity: 0.7, marginTop: 3 },
  amount: { fontWeight: '900' },
  income: { opacity: 0.9 },
  expense: { opacity: 0.9 },
  locked: { borderWidth: 1, borderColor: '#ddd', borderRadius: 14, padding: 14, gap: 8 },
  lockedTitle: { fontSize: 16, fontWeight: '900' },
  lockedText: { opacity: 0.75, lineHeight: 20 },
  lockedButton: { marginTop: 6, backgroundColor: '#111', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  lockedButtonText: { color: '#fff', fontWeight: '900' },
});
