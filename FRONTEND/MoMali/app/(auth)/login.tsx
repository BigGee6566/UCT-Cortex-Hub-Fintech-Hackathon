import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSession } from '@/hooks/use-session';
import type { LoginErrors } from '@/services/login.validation';

export default function Login() {
  const { signIn } = useSession();
  const [identifier, setIdentifier] = useState('');
  const [secret, setSecret] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    if (submitting) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const result = await signIn(identifier, secret);
      if (!result.ok) {
        setErrors(result.errors);
        setMessage(result.message ?? null);
      }
      // On success the root layout's route guard switches to the tabs.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Log in</Text>
      <Text style={styles.subtitle}>Your money. Your control.</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Email or student number</Text>
        <TextInput
          style={[styles.input, errors.identifier ? styles.inputError : null]}
          value={identifier}
          onChangeText={(text) => {
            setIdentifier(text);
            setErrors((e) => ({ ...e, identifier: undefined }));
          }}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="username"
          textContentType="username"
          returnKeyType="next"
          accessibilityLabel="Email or student number"
        />
        {errors.identifier ? <Text style={styles.error}>{errors.identifier}</Text> : null}

        <Text style={styles.label}>Password or PIN</Text>
        <TextInput
          style={[styles.input, errors.secret ? styles.inputError : null]}
          value={secret}
          onChangeText={(text) => {
            setSecret(text);
            setErrors((e) => ({ ...e, secret: undefined }));
          }}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={onSubmit}
          accessibilityLabel="Password or PIN"
        />
        {errors.secret ? <Text style={styles.error}>{errors.secret}</Text> : null}

        {message ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {message}
          </Text>
        ) : null}

        <Pressable
          style={[styles.button, submitting && styles.buttonDisabled]}
          accessibilityRole="button"
          accessibilityState={{ disabled: submitting }}
          disabled={submitting}
          onPress={onSubmit}>
          <Text style={styles.buttonText}>Log in</Text>
        </Pressable>
      </View>

      <Text style={styles.note}>
        Demo sign-in: your details stay on this device. No account is created on a server, and your
        password or PIN is never saved.
      </Text>

      <Pressable accessibilityRole="link" onPress={() => router.push('/(auth)/onboarding')}>
        <Text style={styles.link}>What is Mo’Mali?</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 16, opacity: 0.7, textAlign: 'center' },
  form: { width: '100%', maxWidth: 420, gap: 8, marginTop: 8 },
  label: { fontSize: 15, fontWeight: '700', marginTop: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  inputError: { borderColor: '#B3261E' },
  error: { color: '#B3261E', fontWeight: '600' },
  button: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, backgroundColor: '#111', alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '700' },
  note: { maxWidth: 420, textAlign: 'center', opacity: 0.65, lineHeight: 20, marginTop: 8 },
  link: { fontWeight: '700', textDecorationLine: 'underline', marginTop: 4 },
});
