import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import type { QuestionnaireAnswers } from '@/types/questionnaire';
import { defaultQuestionnaire, getQuestionnaire, saveQuestionnaire } from '@/services/questionnaire.service';
import { setAppState } from '@/services/appState.service'; // if you already use it
import { Colors, Radii, Spacing, Typography } from '@/constants/theme';


export default function GoalsScreen() {
  const [data, setData] = useState<QuestionnaireAnswers | null>(null);

  useEffect(() => {
    (async () => setData(await getQuestionnaire()))();
  }, []);

  if (!data) return <Center label="Loading..." />;

  const challengeOptions = [
    'Overspending',
    'No budget',
    'Debt / Loans',
    'Impulse buying',
    'Irregular income',
    'Too many subscriptions',
    'Other',
  ] as const;

  const goalOptions = ['Save', 'Pay debt', 'Budget better', 'Build credit', 'Emergency fund'] as const;

  function toggleChallenge(value: (typeof challengeOptions)[number]) {
    setData((prev) => {
      if (!prev) return prev;
      const current = prev.step4.biggestChallenges;
      const exists = current.includes(value);
      return {
        ...prev,
        step4: {
          ...prev.step4,
          biggestChallenges: exists ? current.filter((v) => v !== value) : [...current, value],
        },
      };
    });
  }

  function toggleGoal(value: (typeof goalOptions)[number]) {
    setData((prev) => {
      if (!prev) return prev;
      const current = prev.step4.goals;
      const exists = current.includes(value);
      return {
        ...prev,
        step4: {
          ...prev.step4,
          goals: exists ? current.filter((v) => v !== value) : [...current, value],
        },
      };
    });
  }

  async function finish() {
    if (!data) return;
    await saveQuestionnaire(data);
    await saveQuestionnaire(defaultQuestionnaire());

    router.replace('/(auth)/consent');

    // If you track app progress, set next stage to CONSENT:
    try {
      await setAppState({ progress: 'CONSENT' as any });
    } catch {
      // ignore if you haven't added appState.service yet
    }
  }

  async function back() {
    if (!data) return;
    await saveQuestionnaire(data);
    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.container}>
        <ProgressHeader stepLabel="4/4" title="Challenges & Goals" subtitle="This helps Mo'Mali personalise advice." />

      <Text style={styles.label}>Biggest money challenges</Text>
      <OptionList
        options={challengeOptions as unknown as string[]}
        values={data.step4.biggestChallenges}
        onToggle={toggleChallenge}
      />

      <Text style={[styles.label, { marginTop: 12 }]}>Goals</Text>
      <OptionList options={goalOptions as unknown as string[]} values={data.step4.goals} onToggle={toggleGoal} />

        <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <Text style={styles.summaryText}>
          Challenges:{' '}
          <Text style={{ fontWeight: '900' }}>
            {data.step4.biggestChallenges.length ? data.step4.biggestChallenges.join(', ') : 'None'}
          </Text>
        </Text>
        <Text style={styles.summaryText}>
          Goals:{' '}
          <Text style={{ fontWeight: '900' }}>
            {data.step4.goals.length ? data.step4.goals.join(', ') : 'None'}
          </Text>
        </Text>
      </View>

        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          <SecondaryButton label="Back" onPress={back} />
          <PrimaryButton label="Finish" onPress={finish} />
        </View>
      </View>
    </ScrollView>
  );
}

/** UI */
function ProgressHeader({ stepLabel, title, subtitle }: { stepLabel: string; title: string; subtitle: string }) {
  return (
    <View style={{ gap: 6, marginBottom: 6 }}>
      <Text style={styles.step}>{stepLabel}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>{subtitle}</Text>
    </View>
  );
}

function OptionList({
  options,
  values,
  onToggle,
}: {
  options: string[];
  values: string[];
  onToggle: (v: any) => void;
}) {
  return (
    <View style={styles.dropdown}>
      {options.map((o) => {
        const active = values.includes(o);
        return (
          <Pressable key={o} onPress={() => onToggle(o)} style={styles.dropRow} accessibilityRole="button">
            <View style={[styles.radio, active && styles.radioOn]} />
            <Text style={styles.dropText}>{o}</Text>
          </Pressable>
        );
      })}
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

  label: { fontWeight: '700', marginTop: Spacing.xs, color: Colors.light.text },

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

  summary: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.md,
    marginTop: Spacing.xs,
    gap: Spacing.xs,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  summaryTitle: { fontWeight: '800', color: Colors.light.text },
  summaryText: { color: Colors.light.mutedText, fontWeight: '600' },

  btn: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.button,
    alignItems: 'center',
    marginTop: Spacing.xs,
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
    marginTop: Spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
  },
  btnGhostText: { color: Colors.light.primary, fontWeight: '800' },
});
