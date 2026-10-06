import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { clearAppData } from '@/services/storage';

export default function Profile() {
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function resetAppData() {
    setResetting(true);
    try {
      await clearAppData();
      setMessage('All Mo’Mali data on this device was deleted.');
      setConfirmingReset(false);
    } catch {
      setMessage('We couldn’t reset your data. Please try again.');
    } finally {
      setResetting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <Pressable style={styles.button} accessibilityRole="button" onPress={() => router.replace('/(auth)/login')}>
        <Text style={styles.buttonText}>Log out</Text>
      </Pressable>

      <View style={styles.dangerZone}>
        {confirmingReset ? (
          <>
            <Text style={styles.warning}>
              This deletes your budgets and consent choices on this device. It can’t be undone.
            </Text>
            <View style={styles.actions}>
              <Pressable
                style={[styles.smallButton, styles.ghost]}
                accessibilityRole="button"
                onPress={() => setConfirmingReset(false)}>
                <Text style={styles.ghostText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.smallButton, styles.danger, resetting && styles.disabled]}
                accessibilityRole="button"
                accessibilityState={{ disabled: resetting }}
                disabled={resetting}
                onPress={resetAppData}>
                <Text style={styles.buttonText}>{resetting ? 'Deleting…' : 'Delete data'}</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Pressable
            style={[styles.button, styles.ghost]}
            accessibilityRole="button"
            onPress={() => {
              setMessage(null);
              setConfirmingReset(true);
            }}>
            <Text style={styles.ghostText}>Reset App Data</Text>
          </Pressable>
        )}

        {message ? (
          <Text style={styles.message} accessibilityLiveRegion="polite">
            {message}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 26, fontWeight: '800' },
  button: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, backgroundColor: '#111' },
  buttonText: { color: '#fff', fontWeight: '700' },
  dangerZone: { marginTop: 32, alignItems: 'center', gap: 12, maxWidth: 360 },
  warning: { textAlign: 'center', lineHeight: 20, opacity: 0.8 },
  actions: { flexDirection: 'row', gap: 10 },
  smallButton: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, alignItems: 'center' },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#B3261E' },
  ghostText: { color: '#B3261E', fontWeight: '700' },
  danger: { backgroundColor: '#B3261E' },
  disabled: { opacity: 0.5 },
  message: { textAlign: 'center', opacity: 0.8 },
});
