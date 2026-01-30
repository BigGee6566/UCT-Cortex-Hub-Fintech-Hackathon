import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Colors, Radii, Spacing, Typography } from '@/constants/theme';


export default function LoginScreen() {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

  function onLogin() {
    const normalizedEmail = id.trim().toLowerCase();
    if (!normalizedEmail || !pw.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    router.replace('/(auth)/questionnaire/income-sources');
  }

  function handleSocial(provider: string) {
    Alert.alert(provider, 'Social login is coming soon.');
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Image source={require('@/assets/images/logo2.png')} style={styles.logo} contentFit="contain" accessibilityLabel="MoMali logo" />

        <Text style={styles.title}>Welcome to MoMali</Text>
        <Text style={styles.sub}>Your all-in-one smart finance app that is intelligent, simple, and personalized for you</Text>

        <Text style={styles.sectionTitle}>Get started</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={id}
          onChangeText={setId}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={[styles.input, styles.inputFocus]}
          placeholder="Password"
          secureTextEntry
          autoCapitalize="none"
          value={pw}
          onChangeText={setPw}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.terms}>
          By clicking on continue you agree to our Terms and conditions and okay with our Privacy
        </Text>

        <Pressable style={styles.primaryBtn} onPress={onLogin} accessibilityRole="button">
          <Text style={styles.primaryText}>Continue</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <Pressable style={styles.socialBtn} accessibilityRole="button" onPress={() => handleSocial('Google')}>
          <Image source={require('@/assets/images/google.png')} style={styles.socialIcon} contentFit="contain" />
          <Text style={styles.socialText}>Continue with Google</Text>
        </Pressable>
        <Pressable style={styles.socialBtn} accessibilityRole="button" onPress={() => handleSocial('Apple ID')}>
          <Image source={require('@/assets/images/apple.png')} style={styles.socialIcon} contentFit="contain" />
          <Text style={styles.socialText}>Continue with Apple ID</Text>
        </Pressable>

        <View style={styles.linksRow}>
          <Text style={styles.linkText}>Haven't an account?</Text>
          <Pressable onPress={() => router.replace('/(auth)/signup')} accessibilityRole="button">
            <Text style={styles.link}>Register</Text>
          </Pressable>
        </View>
        <Pressable onPress={() => Alert.alert('Forgot password', 'Password recovery is coming soon.')} accessibilityRole="button">
          <Text style={styles.link}>Forgot password?</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: Spacing.lg,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    
  },
  logo: { width: 72, height: 72, marginBottom: Spacing.xs },
  title: { fontSize: Typography.title, fontWeight: '800', color: Colors.light.text, textAlign: 'center' },
  sub: { color: Colors.light.mutedText, textAlign: 'center' },
  sectionTitle: { marginTop: Spacing.sm, fontWeight: '700', color: Colors.light.text },

  label: { alignSelf: 'flex-start', color: Colors.light.text, fontWeight: '700' },
  input: {
    width: '100%',
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radii.input,
    padding: Spacing.sm,
    color: Colors.light.text,
  },
  inputFocus: { borderColor: Colors.light.secondary },

  terms: { color: Colors.light.mutedText, textAlign: 'center', fontSize: Typography.small },
  error: { color: Colors.light.error, fontWeight: '600' },

  primaryBtn: {
    width: '100%',
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.card,
    borderWidth: 1,
    borderRadius: Radii.button,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    minHeight: 44,
  },
  primaryText: { color: Colors.light.onAccent, fontWeight: '800' },

  dividerRow: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  divider: { flex: 1, height: 1, backgroundColor: Colors.light.border },
  dividerText: { color: Colors.light.mutedText },

  socialBtn: {
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radii.button,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 44,
    backgroundColor: Colors.light.card,
  },
  socialText: { color: Colors.light.text, fontWeight: '700' },
  socialIcon: { width: 18, height: 18 },

  linksRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  linkText: { color: Colors.light.mutedText },
  link: { color: Colors.light.primary, fontWeight: '700' },
});
