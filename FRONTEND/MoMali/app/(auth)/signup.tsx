import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Colors, Radii, Spacing, Typography } from '@/constants/theme';
import { ProgressBar } from '@/components/ui/ProgressBar';

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0..4
}

export default function SignUpScreen() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [agree, setAgree] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [pw, setPw] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const strength = useMemo(() => passwordStrength(pw), [pw]);
  const ruleLength = pw.length >= 10;
  const ruleLowerCase = /[a-z]/.test(pw);
  const ruleUpperCase = /[A-Z]/.test(pw);
  const ruleNumber = /[0-9]/.test(pw);
  const ruleSpecial = /[^A-Za-z0-9]/.test(pw);
  const progress = step === 0 ? 0.25 : step === 1 ? 0.6 : 1;

  function nextFromInfo() {
    if (!firstName.trim() || !surname.trim() || !email.trim() || !phone.trim() || !agree) {
      setError('Please complete all required fields and accept the terms.');
      return;
    }
    setError('');
    setStep(1);
  }

  function nextFromPassword() {
    if (strength < 3) {
      setError('Please choose a stronger password.');
      return;
    }
    setError('');
    setStep(2);
  }

  function verifyCode() {
    if (code.trim().length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }
    setError('');
    router.replace('/(auth)/login');
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Pressable style={styles.iconBtn} onPress={() => (step === 0 ? router.back() : setStep((s) => (s - 1) as 0 | 1 | 2))} accessibilityRole="button">
            <Text style={styles.iconText}>←</Text>
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => router.replace('/(auth)/login')} accessibilityRole="button">
            <Text style={styles.iconText}>x</Text>
          </Pressable>
        </View>

        {/* <Image source={require('@/assets/images/logo.png')} style={styles.logo} contentFit="contain" /> */}

        {step === 0 && (
          <>
            <Text style={styles.title}>Tell us about yourself</Text>
            <ProgressBar value={progress} />

            <Text style={styles.label}>First name</Text>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First name" />

            <Text style={styles.label}>Surname</Text>
            <TextInput style={styles.input} value={surname} onChangeText={setSurname} placeholder="Surname" />

            <Text style={styles.label}>Email address</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" />

            <Text style={styles.label}>Phone number</Text>
            <View style={styles.phoneRow}>
              <View style={styles.flagBox}>
                <Text style={styles.flagText}>+27</Text>
              </View>
              <TextInput style={[styles.input, { flex: 1 }]} value={phone} onChangeText={setPhone} placeholder="Phone number" keyboardType="phone-pad" />
            </View>

            <Text style={styles.label}>Date of birth</Text>
            <View style={styles.dobRow}>
              <TextInput style={[styles.input, styles.dob]} value={dobDay} onChangeText={setDobDay} placeholder="dd" keyboardType="number-pad" />
              <TextInput style={[styles.input, styles.dob]} value={dobMonth} onChangeText={setDobMonth} placeholder="mm" keyboardType="number-pad" />
              <TextInput style={[styles.input, styles.dob]} value={dobYear} onChangeText={setDobYear} placeholder="yyyy" keyboardType="number-pad" />
            </View>

            <Pressable style={styles.termsRow} onPress={() => setAgree((v) => !v)} accessibilityRole="button">
              <View style={[styles.checkbox, agree && styles.checkboxOn]} />
              <Text style={styles.termsText}>I agree to the Terms & Conditions and Privacy Policy</Text>
            </Pressable>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable style={styles.primaryBtn} onPress={nextFromInfo} accessibilityRole="button">
              <Text style={styles.primaryText}>Next</Text>
            </Pressable>
          </>
        )}

        {step === 1 && (
          <>
            <Text style={styles.title}>Create Password</Text>
            <ProgressBar value={progress} />

            <View style={styles.shield}>
              <Image source={require('@/assets/images/lock.png')} style={styles.lockImage} contentFit="contain" />
            </View>

            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} value={pw} onChangeText={setPw} placeholder="Password" secureTextEntry />

            <View style={styles.rules}>
              <RuleItem ok={ruleLength} label="At least 10 characters" />
              <RuleItem ok={ruleUpperCase} label="Uppercase letter" />
              <RuleItem ok={ruleLowerCase} label="lowercase letters" />
              <RuleItem ok={ruleNumber} label="At least 1 number" />
              <RuleItem ok={ruleSpecial} label="At least 1 special character" />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable style={styles.primaryBtn} onPress={nextFromPassword} accessibilityRole="button">
              <Text style={styles.primaryText}>Continue</Text>
            </Pressable>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.title}>Email Verification</Text>
            <ProgressBar value={progress} />

            <Text style={styles.sub}>Enter the 6-digit code sent to {email || 'your email'}.</Text>
            <TextInput style={styles.input} value={code} onChangeText={setCode} placeholder="Verification code" keyboardType="number-pad" />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable style={styles.primaryBtn} onPress={verifyCode} accessibilityRole="button">
              <Text style={styles.primaryText}>Verify</Text>
            </Pressable>
          </>
        )}
      </View>
    </ScrollView>
  );
}

function RuleItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <View style={styles.ruleRow}>
      <View style={[styles.ruleDot, ok ? styles.ruleDotOk : styles.ruleDotBad]} />
      <Text style={[styles.ruleText, ok ? styles.ruleTextOk : styles.ruleTextBad]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: Spacing.lg, backgroundColor: Colors.light.background, alignItems: 'center', justifyContent: 'center' },
  card: {
    width: '100%',
    maxWidth: 620,
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 30, color: Colors.light.text },
  logo: { width: 140, height: 140, alignSelf: 'center' },
  title: { fontSize: Typography.title, fontWeight: '800', color: Colors.light.text },
  sub: { color: Colors.light.mutedText },
  label: { color: Colors.light.text, fontWeight: '700', marginTop: Spacing.xs },
  input: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radii.input,
    padding: Spacing.sm,
    color: Colors.light.text,
  },
  phoneRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  flagBox: { borderWidth: 1, borderColor: Colors.light.border, borderRadius: Radii.input, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm },
  flagText: { fontWeight: '700', color: Colors.light.text },
  dobRow: { flexDirection: 'row', gap: Spacing.sm },
  dob: { flex: 1, textAlign: 'center' },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: Colors.light.primary, backgroundColor: Colors.light.card },
  checkboxOn: { backgroundColor: Colors.light.primary },
  termsText: { flex: 1, color: Colors.light.text, fontWeight: '600' },
  error: { color: Colors.light.error, fontWeight: '600' },
  primaryBtn: { marginTop: Spacing.sm, backgroundColor: '#0E1A33', borderRadius: Radii.button, paddingVertical: Spacing.sm, alignItems: 'center', minHeight: 44 },
  primaryText: { color: '#ffff', fontWeight: '800' },
  shield: { alignSelf: 'center', width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF4C2', alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm },
  lockImage: { width: 76, height: 86 },
  rules: { gap: 6 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  ruleDot: { width: 10, height: 10, borderRadius: 999 },
  ruleDotOk: { backgroundColor: Colors.light.success },
  ruleDotBad: { backgroundColor: Colors.light.error },
  ruleText: { color: Colors.light.mutedText },
  ruleTextOk: { color: Colors.light.success, fontWeight: '700' },
  ruleTextBad: { color: Colors.light.error, fontWeight: '700' },
});
