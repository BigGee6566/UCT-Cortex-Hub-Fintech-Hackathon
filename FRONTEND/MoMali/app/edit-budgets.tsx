import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import {
  getBudgets,
  parseBudgetInputs,
  saveBudgets,
  type BudgetFormErrors,
} from '@/services/budget.service';
import { CATEGORIES, type Category } from '@/types/finance';

type FormValues = Record<Category, string>;

export default function EditBudgets() {
  const [values, setValues] = useState<FormValues | null>(null);
  const [errors, setErrors] = useState<BudgetFormErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true; // ignore the result if the editor closes before it loads

    getBudgets()
      .then((budgets) => {
        if (!active) return;
        setValues(Object.fromEntries(CATEGORIES.map((c) => [c, String(budgets[c])])) as FormValues);
      })
      .catch(() => {
        if (active) setMessage('We couldn’t load your budgets. Please try again.');
      });

    return () => {
      active = false;
    };
  }, []);

  function close() {
    // When the editor is opened directly (e.g. a web refresh) there is nothing to go back to.
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/budgets');
  }

  function onChange(category: Category, text: string) {
    setValues((v) => (v ? { ...v, [category]: text } : v));
    setErrors((e) => ({ ...e, [category]: undefined })); // clear the error once the user edits
  }

  async function onSave() {
    if (!values || saving) return;

    const result = parseBudgetInputs(values);
    if (!result.ok) {
      setErrors(result.errors);
      setMessage('Please fix the highlighted amounts.');
      return;
    }

    setSaving(true);
    try {
      await saveBudgets(result.budgets);
      close();
    } catch {
      setMessage('We couldn’t save your budgets. Please try again.');
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Edit budgets</Text>
      <Text style={styles.subtitle}>Monthly limit per category, in rand. Use 0 for no limit.</Text>

      {values ? (
        <View style={styles.card}>
          {CATEGORIES.map((category) => (
            <View key={category} style={styles.field}>
              <Text style={styles.label}>{category}</Text>
              <TextInput
                style={[styles.input, errors[category] ? styles.inputError : null]}
                value={values[category]}
                onChangeText={(text) => onChange(category, text)}
                keyboardType="decimal-pad"
                inputMode="decimal"
                accessibilityLabel={`${category} budget in rand`}
                placeholder="0"
              />
              {errors[category] ? <Text style={styles.error}>{errors[category]}</Text> : null}
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.subtitle}>Loading budgets…</Text>
      )}

      {message ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {message}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Pressable style={[styles.btn, styles.btnGhost]} accessibilityRole="button" onPress={close}>
          <Text style={[styles.btnText, styles.btnTextDark]}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.btn, styles.btnPrimary, (!values || saving) && styles.btnDisabled]}
          accessibilityRole="button"
          accessibilityState={{ disabled: !values || saving }}
          disabled={!values || saving}
          onPress={onSave}>
          <Text style={[styles.btnText, styles.btnTextLight]}>{saving ? 'Saving…' : 'Save budgets'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { opacity: 0.75, lineHeight: 20 },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 14, padding: 14, gap: 12 },
  field: { gap: 6 },
  label: { fontSize: 16, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  inputError: { borderColor: '#B3261E' },
  error: { color: '#B3261E', fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  btnGhost: { borderWidth: 1, borderColor: '#111', backgroundColor: 'transparent' },
  btnPrimary: { backgroundColor: '#111' },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontWeight: '800' },
  btnTextLight: { color: '#fff' },
  btnTextDark: { color: '#111' },
});
