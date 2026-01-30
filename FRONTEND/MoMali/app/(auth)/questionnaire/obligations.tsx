import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import type { BillItem, Frequency, QuestionnaireAnswers } from '@/types/questionnaire';
import { getQuestionnaire, saveQuestionnaire } from '@/services/questionnaire.service';
import { Colors, Radii, Spacing, Typography } from '@/constants/theme';


const FREQS: Frequency[] = ['Daily', 'Weekly', 'Monthly'];

export default function ObligationsScreen() {
  const [data, setData] = useState<QuestionnaireAnswers | null>(null);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('0');
  const [freq, setFreq] = useState<Frequency>('Monthly');

  useEffect(() => {
    (async () => setData(await getQuestionnaire()))();
  }, []);

  const totalBills = useMemo(() => {
    if (!data) return 0;
    return data.step2.bills.reduce((sum, b) => sum + (Number.isFinite(b.amount) ? b.amount : 0), 0);
  }, [data]);

  if (!data) return <Center label="Loading..." />;

  function addBill() {
    const cleanName = name.trim();
    const nAmount = Number(amount.replace(/[^\d]/g, '')) || 0;
    if (!cleanName || nAmount <= 0) return;

    const bill: BillItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: cleanName,
      amount: nAmount,
      frequency: freq,
    };

    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, step2: { bills: [bill, ...prev.step2.bills] } };
    });

    setName('');
    setAmount('0');
    setFreq('Monthly');
  }

  function removeBill(id: string) {
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, step2: { bills: prev.step2.bills.filter((b) => b.id !== id) } };
    });
  }

  async function next() {
    if (!data) return;
    await saveQuestionnaire(data);
    router.push('/(auth)/questionnaire/spending-habits');
  }

  async function back() {
    if (!data) return;
    await saveQuestionnaire(data);
    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.container}>
        <ProgressHeader stepLabel="2/4" title="Monthly Obligations" subtitle="Add your bills & subscriptions." />

        <View style={styles.card}>
          <Text style={styles.label}>Add a bill</Text>

          <TextInput
            style={styles.input}
            placeholder="Bill name (e.g., Rent, Netflix, Data)"
            placeholderTextColor={Colors.light.mutedText}
            value={name}
            onChangeText={setName}
          />

          <View style={styles.moneyWrap}>
            <Text style={styles.currency}>R</Text>
            <TextInput
              style={styles.moneyInput}
              keyboardType="numeric"
              value={amount}
              onChangeText={(t: string) => setAmount(t.replace(/[^\d]/g, '') || '0')}
            />
          </View>

          <View style={styles.pills}>
            {FREQS.map((f) => (
              <Pill key={f} label={f} active={freq === f} onPress={() => setFreq(f)} />
            ))}
          </View>

          <PrimaryButton label="Add bill" onPress={addBill} />
        </View>

        <Text style={styles.sectionTitle}>Your bills</Text>

        {data.step2.bills.length === 0 ? (
          <Text style={styles.empty}>No bills added yet.</Text>
        ) : (
          data.step2.bills.map((b) => (
            <View key={b.id} style={styles.billRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.billName}>{b.name}</Text>
                <Text style={styles.billMeta}>
                  {b.frequency} - R {b.amount.toFixed(0)}
                </Text>
              </View>

              <Pressable onPress={() => removeBill(b.id)} style={styles.deleteBtn} accessibilityRole="button">
                <Text style={styles.deleteText}>Remove</Text>
              </Pressable>
            </View>
          ))
        )}

        <Text style={styles.meta}>Total bills (raw): R {totalBills.toFixed(0)}</Text>

        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          <SecondaryButton label="Back" onPress={back} />
          <PrimaryButton label="Next" onPress={next} />
        </View>
      </View>
    </ScrollView>
  );
}

/** UI bits */
function ProgressHeader({ stepLabel, title, subtitle }: { stepLabel: string; title: string; subtitle: string }) {
  return (
    <View style={{ gap: 6, marginBottom: 6 }}>
      <Text style={styles.step}>{stepLabel}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>{subtitle}</Text>
    </View>
  );
}

function Pill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, active && styles.pillOn]} accessibilityRole="button">
      <Text style={[styles.pillText, active && styles.pillTextOn]}>{label}</Text>
    </Pressable>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.btn} onPress={onPress} accessibilityRole="button">
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}
function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.btnGhost} onPress={onPress} accessibilityRole="button">
      <Text style={styles.btnGhostText}>{label}</Text>
    </Pressable>
  );
}

function Center({ label }: { label: string }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
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
  step: { textAlign: 'center', color: Colors.light.mutedText, fontWeight: '700', fontSize: Typography.small },
  title: { textAlign: 'center', fontSize: Typography.title, fontWeight: '800', color: Colors.light.text },
  sub: { textAlign: 'center', color: Colors.light.mutedText, fontWeight: '600', fontSize: Typography.small },

  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.md,
    gap: Spacing.sm,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  label: { fontWeight: '700', color: Colors.light.text, fontSize: Typography.body },
  input: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radii.input,
    padding: Spacing.md,
    fontSize: Typography.body,
    color: Colors.light.text,
  },

  moneyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radii.input,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.card,
  },
  currency: { fontWeight: '700', marginRight: Spacing.xs, color: Colors.light.text },
  moneyInput: { flex: 1, fontSize: Typography.body, fontWeight: '600', color: Colors.light.text },

  pills: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  pill: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.pill,
  },
  pillOn: { backgroundColor: Colors.light.primary, borderColor: Colors.light.card },
  pillText: { fontWeight: '700', color: Colors.light.text },
  pillTextOn: { color: Colors.light.onAccent },

  sectionTitle: { fontWeight: '800', marginTop: Spacing.xs, color: Colors.light.text },
  empty: { color: Colors.light.mutedText, textAlign: 'center', marginTop: Spacing.xs },

  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.sm,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  billName: { fontWeight: '800', color: Colors.light.text },
  billMeta: { color: Colors.light.mutedText, marginTop: 4, fontWeight: '600' },

  deleteBtn: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.button,
    borderWidth: 1,
    borderColor: Colors.light.border,
    minHeight: 44,
    justifyContent: 'center',
  },
  deleteText: { fontWeight: '700', color: Colors.light.error },

  meta: { textAlign: 'center', color: Colors.light.mutedText, fontWeight: '600', marginTop: Spacing.xs },

  btn: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.button,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  btnText: { color: Colors.light.onAccent, fontWeight: '800' },
  btnGhost: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.card,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.button,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  btnGhostText: { color: Colors.light.primary, fontWeight: '800' },
});
