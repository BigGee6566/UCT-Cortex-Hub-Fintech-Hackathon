import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Switch, ScrollView } from 'react-native';
import { router } from 'expo-router';
import {
  getConsent,
  hasConsentHistory,
  isConsentActive,
  revokeAllConsent,
  updateConsent,
  type ScopeChoices,
} from '@/services/consent.service';
import { SCOPES, SCOPE_LABELS, type ConsentState, type Scope, type ScopeGrant } from '@/types/consent';

// What a first-time user sees pre-selected (unchanged from the original modal).
const FIRST_TIME_CHOICES: ScopeChoices = {
  'balances:read': true,
  'transactions:read': true,
  'income:read': true,
  'debit_orders:read': false,
};

export default function ConsentModal() {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [choices, setChoices] = useState<ScopeChoices | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Start from the user's current choices, so "Manage Consent" shows what is really granted.
  useEffect(() => {
    let active = true;
    getConsent().then((current) => {
      if (!active) return;
      setConsent(current);
      setChoices(
        hasConsentHistory(current)
          ? (Object.fromEntries(SCOPES.map((s) => [s, current.scopes[s].granted])) as ScopeChoices)
          : FIRST_TIME_CHOICES
      );
    });
    return () => {
      active = false;
    };
  }, []);

  const selectedCount = useMemo(() => (choices ? SCOPES.filter((s) => choices[s]).length : 0), [choices]);
  const managing = consent !== null && isConsentActive(consent);

  function close() {
    // Opened directly (e.g. a web refresh) there is no screen to go back to.
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  }

  async function run(action: () => Promise<unknown>) {
    if (saving) return;
    setSaving(true);
    try {
      await action();
      close();
    } catch {
      setMessage('We couldn’t save your choices. Please try again.');
      setSaving(false);
    }
  }

  const toggle = (scope: Scope, value: boolean) => setChoices((c) => (c ? { ...c, [scope]: value } : c));
  const save = () => {
    if (choices) run(() => updateConsent(choices));
  };
  const revokeAll = () => run(() => revokeAllConsent());

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{managing ? 'Manage your consent' : 'Connect your bank data'}</Text>
      <Text style={styles.subtitle}>
        Mo’Mali uses your permission to read your data (Open Banking style). You can change this later.
      </Text>
      <Text style={styles.demoNote}>Demo: no bank account is connected yet. Permissions control what the app shows from demo data.</Text>

      {choices && consent ? (
        <View style={styles.card}>
          {SCOPES.map((scope) => (
            <Row
              key={scope}
              label={SCOPE_LABELS[scope]}
              value={choices[scope]}
              grant={consent.scopes[scope]}
              onChange={(v) => toggle(scope, v)}
            />
          ))}
        </View>
      ) : (
        <Text style={styles.meta}>Loading your choices…</Text>
      )}

      <Text style={styles.meta}>Selected permissions: {selectedCount} / {SCOPES.length}</Text>

      {message ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {message}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Pressable style={[styles.btn, styles.btnGhost]} accessibilityRole="button" onPress={close}>
          <Text style={[styles.btnText, styles.btnTextDark]}>{managing ? 'Cancel' : 'Not now'}</Text>
        </Pressable>
        <Pressable
          style={[styles.btn, styles.btnPrimary, (saving || (!managing && selectedCount === 0)) && styles.btnDisabled]}
          accessibilityRole="button"
          accessibilityState={{ disabled: saving || (!managing && selectedCount === 0) }}
          disabled={saving || (!managing && selectedCount === 0)}
          onPress={save}>
          <Text style={[styles.btnText, styles.btnTextLight]}>{managing ? 'Save changes' : 'Agree & Continue'}</Text>
        </Pressable>
      </View>

      {managing ? (
        <Pressable style={styles.revoke} accessibilityRole="button" disabled={saving} onPress={revokeAll}>
          <Text style={styles.revokeText}>Revoke all access</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

function Row({
  label,
  value,
  grant,
  onChange,
}: {
  label: string;
  value: boolean;
  grant: ScopeGrant;
  onChange: (v: boolean) => void;
}) {
  // Show when the stored permission last changed (YYYY-MM-DD keeps it locale-independent).
  const history = grant.granted
    ? grant.grantedAt && `Granted ${grant.grantedAt.slice(0, 10)}`
    : grant.revokedAt && `Revoked ${grant.revokedAt.slice(0, 10)}`;

  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {history ? <Text style={styles.rowMeta}>{history}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onChange} accessibilityLabel={label} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: 'center', gap: 12 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { opacity: 0.75, lineHeight: 20 },
  demoNote: { opacity: 0.6, lineHeight: 18, fontSize: 13 },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 14, padding: 14, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  rowLabel: { fontSize: 16, fontWeight: '600' },
  rowMeta: { opacity: 0.6, fontSize: 12, marginTop: 2 },
  meta: { textAlign: 'center', opacity: 0.7 },
  error: { color: '#B3261E', fontWeight: '600', textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  btnGhost: { borderWidth: 1, borderColor: '#111', backgroundColor: 'transparent' },
  btnPrimary: { backgroundColor: '#111' },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontWeight: '800' },
  btnTextLight: { color: '#fff' },
  btnTextDark: { color: '#111' },
  revoke: { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 12 },
  revokeText: { color: '#B3261E', fontWeight: '700' },
});
