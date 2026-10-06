import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { buildBudgetRows, getBudgets, type BudgetCategory } from '@/services/budget.service';
import { getTransactions } from '@/services/transactions.service';

export default function BudgetsScreen() {
  const [rows, setRows] = useState<BudgetCategory[] | null>(null);
  const [spendingVisible, setSpendingVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reload each time the tab gains focus, e.g. after saving in the editor or changing consent.
  useFocusEffect(
    useCallback(() => {
      let active = true; // drop results that arrive after the screen loses focus

      Promise.all([getBudgets(), getTransactions()])
        .then(([budgets, transactions]) => {
          if (!active) return;
          // Limits are the user's own data; spending needs transactions:read.
          const visible = transactions.status === 'ok';
          setRows(buildBudgetRows(budgets, visible ? transactions.data : []));
          setSpendingVisible(visible);
          setError(null);
        })
        .catch(() => {
          if (active) setError('We couldn’t load your budgets. Please try again.');
        });

      return () => {
        active = false;
      };
    }, [])
  );

  const totals = useMemo(() => {
    if (!rows) return null;
    return {
      spent: rows.reduce((sum, r) => sum + r.spent, 0),
      limit: rows.reduce((sum, r) => sum + r.limit, 0),
    };
  }, [rows]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Budgets</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {totals && spendingVisible ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total spent</Text>
          <Text style={styles.cardSub}>
            R {totals.spent.toFixed(0)} of R {totals.limit.toFixed(0)} budgeted
          </Text>
        </View>
      ) : null}

      {totals && !spendingVisible ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Spending is hidden</Text>
          <Text style={styles.cardSub}>
            Transactions access is off, so only your limits are shown (R {totals.limit.toFixed(0)} budgeted).
          </Text>
          <Pressable style={[styles.btn, styles.btnGhost]} accessibilityRole="button" onPress={() => router.push('/modal')}>
            <Text style={styles.btnTextDark}>Allow access</Text>
          </Pressable>
        </View>
      ) : null}

      <Pressable
        style={styles.btn}
        accessibilityRole="button"
        onPress={() => router.push('/edit-budgets')}>
        <Text style={styles.btnText}>Edit Budgets</Text>
      </Pressable>

      <FlatList
        data={rows ?? []}
        keyExtractor={(row) => row.category}
        contentContainerStyle={{ paddingBottom: 18 }}
        renderItem={({ item }) => <BudgetRow row={item} spendingVisible={spendingVisible} />}
        ListEmptyComponent={error ? null : <Text style={styles.cardSub}>Loading budgets…</Text>}
      />
    </View>
  );
}

function BudgetRow({ row, spendingVisible }: { row: BudgetCategory; spendingVisible: boolean }) {
  if (!spendingVisible) {
    return (
      <View style={styles.row} accessible accessibilityLabel={`${row.category}: limit R ${row.limit.toFixed(0)}. Spending hidden.`}>
        <View style={styles.rowHeader}>
          <Text style={styles.rowTitle}>{row.category}</Text>
          <Text style={styles.rowAmount}>Limit R {row.limit.toFixed(0)}</Text>
        </View>
        <Text style={styles.rowMeta}>Spending hidden</Text>
      </View>
    );
  }

  const pct = row.percentUsed;
  const over = pct !== null && pct > 1;
  const pctText = pct === null ? 'No limit set' : `${Math.round(pct * 100)}% used`;
  const overText = over ? ` · over by R ${(row.spent - row.limit).toFixed(0)}` : '';
  const barWidth = `${Math.min(100, Math.round((pct ?? 0) * 100))}%` as const;

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${row.category}: R ${row.spent.toFixed(0)} spent of R ${row.limit.toFixed(0)}. ${pctText}${overText}`}>
      <View style={styles.rowHeader}>
        <Text style={styles.rowTitle}>{row.category}</Text>
        <Text style={styles.rowAmount}>
          R {row.spent.toFixed(0)} / R {row.limit.toFixed(0)}
        </Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, over && styles.fillOver, { width: barWidth }]} />
      </View>

      <Text style={[styles.rowMeta, over && styles.overText]}>
        {pctText}
        {overText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  title: { fontSize: 22, fontWeight: '900' },
  error: { color: '#B3261E', fontWeight: '700' },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 14, padding: 14, gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: '900' },
  cardSub: { opacity: 0.75, lineHeight: 20 },
  btn: { backgroundColor: '#111', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#111', marginTop: 6 },
  btnText: { color: '#fff', fontWeight: '900' },
  btnTextDark: { color: '#111', fontWeight: '900' },
  row: { paddingVertical: 10, gap: 6, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowTitle: { fontWeight: '800' },
  rowAmount: { fontWeight: '700', opacity: 0.8 },
  track: { height: 8, borderRadius: 999, backgroundColor: '#eee', overflow: 'hidden' },
  fill: { height: 8, borderRadius: 999, backgroundColor: '#111' },
  fillOver: { backgroundColor: '#B3261E' },
  rowMeta: { opacity: 0.7 },
  overText: { color: '#B3261E', opacity: 1, fontWeight: '700' },
});
