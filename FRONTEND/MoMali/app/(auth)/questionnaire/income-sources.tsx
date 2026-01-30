import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import type { Frequency, IncomeSourceKey, QuestionnaireAnswers } from '@/types/questionnaire';
import { getQuestionnaire, saveQuestionnaire } from '@/services/questionnaire.service';
import { Colors, Radii, Spacing, Typography } from '@/constants/theme';


const FREQS: Frequency[] = ['Daily', 'Weekly', 'Monthly'];

export default function IncomeSourcesScreen() {
  const [data, setData] = useState<QuestionnaireAnswers | null>(null);

  useEffect(() => {
    (async () => setData(await getQuestionnaire()))();
  }, []);

  const enabledCount = useMemo(() => {
    if (!data) return 0;
    return Object.values(data.step1.incomeSources).filter((x) => x.enabled).length;
  }, [data]);

  if (!data) return <Center label="Loading..." />;

  const sources = data.step1.incomeSources;

  function toggleSource(key: IncomeSourceKey) {
    setData((prev) => {
      if (!prev) return prev;
      const current = prev.step1.incomeSources[key];
      return {
        ...prev,
        step1: {
          ...prev.step1,
          incomeSources: {
            ...prev.step1.incomeSources,
            [key]: { ...current, enabled: !current.enabled },
          },
        },
      };
    });
  }

  function setSourceAmount(key: IncomeSourceKey, amount: number) {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        step1: {
          ...prev.step1,
          incomeSources: {
            ...prev.step1.incomeSources,
            [key]: { ...prev.step1.incomeSources[key], amount },
          },
        },
      };
    });
  }

  function setSourceFreq(key: IncomeSourceKey, frequency: Frequency) {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        step1: {
          ...prev.step1,
          incomeSources: {
            ...prev.step1.incomeSources,
            [key]: { ...prev.step1.incomeSources[key], frequency },
          },
        },
      };
    });
  }

  async function next() {
    if (!data) return; 
    await saveQuestionnaire(data);
    router.push('/(auth)/questionnaire/obligations');
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.container}>
        <ProgressHeader stepLabel="1/4" title="Income & Employment" />

        <Text style={styles.label}>Employment status</Text>
        <Dropdown
          value={data.step1.employmentStatus}
          options={['Student', 'Employed', 'Self-employed', 'Unemployed', 'Other']}
          onChange={(v) =>
            setData((p) => (p ? { ...p, step1: { ...p.step1, employmentStatus: v as any } } : p))
          }
        />

        <Text style={[styles.label, { marginTop: 10 }]}>Monthly income (rough)</Text>
        <MoneyInput
          value={data.step1.monthlyIncome}
          onChange={(n) =>
            setData((p) => (p ? { ...p, step1: { ...p.step1, monthlyIncome: n } } : p))
          }
        />

        <Text style={[styles.label, { marginTop: 14 }]}>Where does your money come from?</Text>
        <Text style={styles.hint}>Select sources and add amount + frequency.</Text>

        {(Object.keys(sources) as IncomeSourceKey[]).map((key) => {
          const item = sources[key];
          return (
            <View key={key} style={styles.card}>
              <Pressable onPress={() => toggleSource(key)} style={styles.row} accessibilityRole="button">
                <View style={[styles.checkbox, item.enabled && styles.checkboxOn]} />
                <Text style={styles.rowTitle}>{key}</Text>
              </Pressable>

              {item.enabled && (
                <View style={{ gap: 10 }}>
                  <MoneyInput value={item.amount} onChange={(n) => setSourceAmount(key, n)} />
                  <View style={styles.pills}>
                    {FREQS.map((f) => (
                      <Pill
                        key={f}
                        label={f}
                        active={item.frequency === f}
                        onPress={() => setSourceFreq(key, f)}
                      />
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        })}

        <Text style={styles.meta}>Selected sources: {enabledCount}</Text>

        <PrimaryButton label="Next" onPress={next} />
      </View>
    </ScrollView>
  );
}

/** UI bits */
function ProgressHeader({ stepLabel, title }: { stepLabel: string; title: string }) {
  return (
    <View style={{ gap: 6, marginBottom: 6 }}>
      <Text style={styles.step}>{stepLabel}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

function MoneyInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <View style={styles.moneyWrap}>
      <Text style={styles.currency}>R</Text>
      <TextInput
        style={styles.moneyInput}
        keyboardType="numeric"
        value={String(value)}
        onChangeText={(t: string) => {
          const n = Number(t.replace(/[^\d]/g, ''));
          onChange(Number.isFinite(n) ? n : 0);
        }}
        placeholder="0"
        placeholderTextColor={Colors.light.mutedText}
      />
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

function Dropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.dropdown}>
      {options.map((o) => (
        <Pressable key={o} onPress={() => onChange(o)} style={styles.dropRow} accessibilityRole="button">
          <View style={[styles.radio, value === o && styles.radioOn]} />
          <Text style={styles.dropText}>{o}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Center({ label }: { label: string }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{label}</Text>
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
  label: { fontWeight: '700', marginTop: Spacing.xs, color: Colors.light.text },
  hint: { color: Colors.light.mutedText, fontWeight: '600' },
  meta: { textAlign: 'center', color: Colors.light.mutedText, fontWeight: '600', marginTop: Spacing.xs },

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
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rowTitle: { fontWeight: '700', fontSize: Typography.body, color: Colors.light.text },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: Colors.light.border },
  checkboxOn: { backgroundColor: Colors.light.secondary, borderColor: Colors.light.secondary },

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

  dropdown: {
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
  dropRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
  radio: { width: 16, height: 16, borderRadius: 999, borderWidth: 1, borderColor: Colors.light.border },
  radioOn: { backgroundColor: Colors.light.secondary, borderColor: Colors.light.secondary },
  dropText: { fontWeight: '700', color: Colors.light.text },

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