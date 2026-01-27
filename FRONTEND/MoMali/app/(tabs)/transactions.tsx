import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { MOCK_TRANSACTIONS } from '@/services/mockFinance';
import type { Transaction } from '@/types/finance';

type Filter = 'All' | 'Income' | 'Expenses';

export default function Transactions() {
  const [filter, setFilter] = useState<Filter>('All');

  const data = useMemo(() => {
    if (filter === 'Income') return MOCK_TRANSACTIONS.filter((t) => t.amount > 0);
    if (filter === 'Expenses') return MOCK_TRANSACTIONS.filter((t) => t.amount < 0);
    return MOCK_TRANSACTIONS;
  }, [filter]);

  const totals = useMemo(() => {
    const income = MOCK_TRANSACTIONS.filter((t) => t.amount > 0).reduce((a, b) => a + b.amount, 0);
    const expenses = MOCK_TRANSACTIONS.filter((t) => t.amount < 0).reduce((a, b) => a + Math.abs(b.amount), 0);
    return { income, expenses };
  }, []);

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
});
