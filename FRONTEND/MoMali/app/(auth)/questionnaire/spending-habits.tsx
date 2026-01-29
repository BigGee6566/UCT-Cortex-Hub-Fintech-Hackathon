import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import type { QuestionnaireAnswers } from '@/types/questionnaire';
import { getQuestionnaire, saveQuestionnaire } from '@/services/questionnaire.service';
import { Colors, Radii, Spacing, Typography } from '@/constants/theme';

type Cat = keyof QuestionnaireAnswers['step3']['spendCategories'];

export default function SpendingHabitsScreen() {
  const [data, setData] = useState<QuestionnaireAnswers | null>(null);

  useEffect(() => {
    (async () => setData(await getQuestionnaire()))();
  }, []);

  const totalBudget = useMemo(() => {
    if (!data) return 0;
    return (Object.keys(data.step3.spendCategories) as Cat[]).reduce(
      (sum, c) => sum + (Number.isFinite(data.step3.spendCategories[c].budget) ? data.step3.spendCategories[c].budget : 0),
      0
    );
  }, [data]);

  if (!data) return <Center label="Loading..." />;

  const cats = Object.keys(data.step3.spendCategories) as Cat[];

  function setBudget(cat: Cat, value: number) {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        step3: {
          spendCategories: {
            ...prev.step3.spendCategories,
            [cat]: { budget: value },
          },
        },
      };
    });
  }

  async function next() {
    if (!data) return; // type guard

    await saveQuestionnaire(data);
    router.push('/(auth)/questionnaire/goals');
  }


  async function back() {
    if (!data) return;
    await saveQuestionnaire(data);
    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.container}>
        <ProgressHeader stepLabel="3/4" title="Spending Habits" subtitle="Set rough monthly budgets per category." />

        <View style={styles.card}>
          {cats.map((c) => (
            <View key={c} style={styles.row}>
              <Text style={styles.rowLabel}>{c}</Text>
              <View style={styles.moneyWrap}>
                <Text style={styles.currency}>R</Text>
                <TextInput
                  style={styles.moneyInput}
                  keyboardType="numeric"
                  value={String(data.step3.spendCategories[c].budget)}
                  onChangeText={(t) => {
                    const n = Number(t.replace(/[^\d]/g, ''));
                    setBudget(c, Number.isFinite(n) ? n : 0);
                  }}
                />
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.meta}>Total planned monthly spend: R {totalBudget.toFixed(0)}</Text>

        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          <SecondaryButton label="Back" onPress={back} />
          <PrimaryButton label="Next" onPress={next} />
        </View>
      </View>
    </ScrollView>
  );
}

function ProgressHeader({ stepLabel, title, subtitle }: { stepLabel: string; title: string; subtitle: string }) {
  return (
    <View style={{ gap: 6, marginBottom: 6 }}>
      <Text style={styles.step}>{stepLabel}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>{subtitle}</Text>
    </View>
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
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  rowLabel: { fontWeight: '700', flex: 1, minWidth: 0, color: Colors.light.text, fontSize: Typography.body },

  moneyWrap: {
    width: 140,
    minWidth: 120,
    flexShrink: 0,
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
  moneyInput: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    fontSize: Typography.body,
    fontWeight: '600',
    color: Colors.light.text,
    paddingVertical: 0,
  },

  meta: { textAlign: 'center', color: Colors.light.mutedText, fontWeight: '600', marginTop: Spacing.xs },

  btn: {
    flex: 1,
    backgroundColor: '#0E1A33',
    paddingVertical: Spacing.sm,
    borderRadius: Radii.button,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  btnText: { color: '#FFFFFF', fontWeight: '800' },
  btnGhost: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1B2A4A',
    paddingVertical: Spacing.sm,
    borderRadius: Radii.button,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  btnGhostText: { color: '#0E1A33', fontWeight: '800' },
});


