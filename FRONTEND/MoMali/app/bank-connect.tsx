import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Colors, Radii, Spacing, Typography } from '@/constants/theme';
import { createConsent, exchangeConsentToken, getConsentStatus, syncAccounts, syncBalances, syncTransactions } from '@/services/openBanking.service';
import { setItem } from '@/services/storage';


export default function BankConnectModal() {
  const params = useLocalSearchParams();
  const bankName = typeof params.bank === 'string' ? params.bank : 'Bank';
  const bankImages: Record<string, any> = {
    'FNB': require('@/assets/images/Banks/Fnb.png'),
    'Standard Bank': require('@/assets/images/Banks/StandardBank.jpeg'),
    'Capitec': require('@/assets/images/Banks/Capitec.jpeg'),
    'TymeBank': require('@/assets/images/Banks/Tymebank.jpeg'),
    'Nedbank': require('@/assets/images/Banks/Nedbank.png'),
    'ABSA': require('@/assets/images/Banks/Absa.jpeg'),
    'Investec': require('@/assets/images/Banks/Investec.png'),
    'Discovery Bank': require('@/assets/images/Banks/Discovery.png'),
    'African Bank': require('@/assets/images/Banks/Africanbank.jpeg'),
    'Bidvest Bank': require('@/assets/images/Banks/Bidvestbank.png'),
    'Bank Zero': require('@/assets/images/Banks/Bankzero.png'),
    'Sasfin': require('@/assets/images/Banks/Sasfin.jpeg'),
    'Old Mutual': require('@/assets/images/Banks/Oldmutual.jpeg'),
    'Allan Gray': require('@/assets/images/Banks/AllanGrey.png'),
    'EasyEquities': require('@/assets/images/Banks/EasyEquities.png'),
  };
  const bankImage = bankImages[bankName];

  const [phone, setPhone] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  async function waitForAuthorization(consentId: string) {
    const maxAttempts = 10;
    const delayMs = 3000;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const status = await getConsentStatus(consentId);
      const normalizedStatus = status.status?.toLowerCase?.() ?? '';
      if (normalizedStatus.includes('author')) {
        return status;
      }
      if (status.revoked_at) {
        throw new Error('Consent was revoked by the bank.');
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    throw new Error('Consent is still pending. Please finish approval in your bank app.');
  }

  async function linkAccount() {
    if (isLinking) {
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Missing phone number', 'Please enter your phone number to continue.');
      return;
    }
    const normalizedPhone = phone.replace(/\\s+/g, '');
    if (!/^0\\d{9}$/.test(normalizedPhone)) {
      Alert.alert('Invalid phone number', 'Enter a valid South African cellphone number (e.g., 0812345678).');
      return;
    }

    try {
      setIsLinking(true);
      const consent = await createConsent({ userExternalId: normalizedPhone });

      await setItem('momali.user_id', consent.user_id);
      await setItem('momali.consent_id', consent.consent_id);

      if (consent.authorization_url) {
        await WebBrowser.openBrowserAsync(consent.authorization_url);
      }

      await waitForAuthorization(consent.consent_id);
      await exchangeConsentToken(consent.consent_id);
      await syncAccounts(consent.user_id, consent.consent_id);
      await syncBalances(consent.user_id, consent.consent_id);
      await syncTransactions(consent.user_id, consent.consent_id);

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Open Banking error', error?.message ?? 'Unable to start Open Banking consent.');
    } finally {
      setIsLinking(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.container}>
        <Pressable style={styles.backRow} onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.backText}>Back to Providers</Text>
        </Pressable>

        <View style={styles.headerRow}>
          <View style={styles.logoCircle}>
            {bankImage ? (
              <Image source={bankImage} style={styles.logoImage} resizeMode="contain" />
            ) : (
              <Text style={styles.logoText}>{bankName[0]}</Text>
            )}
          </View>
          <View>
            <Text style={styles.title}>{bankName}</Text>
            <Text style={styles.sub}>Enter your phone number to link your account</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Cellphone number *</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. 0609603633"
            placeholderTextColor={Colors.light.mutedText}
            keyboardType="phone-pad"
          />

          <View style={styles.notice}>
            <View style={styles.noticeIcon}>
              <Text style={styles.noticeIconText}>ℹ️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.noticeTitle}>Bank app notifications</Text>
              <Text style={styles.noticeText}>You will see a notification from your bank app to approve the request.</Text>
            </View>
          </View>

          <Pressable style={styles.primary} accessibilityRole="button" onPress={linkAccount} disabled={isLinking}>
            {isLinking ? <ActivityIndicator color={Colors.light.card} /> : <Text style={styles.primaryText}>Link account</Text>}
          </Pressable>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Why this is secure</Text>
          <Text style={styles.infoText}>
            We use Open Banking APIs to connect to your bank. We do not use screen scraping or store your credentials.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    padding: Spacing.lg,
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
  backRow: { alignSelf: 'flex-start' },
  backText: { color: Colors.light.primary, fontWeight: '700' },

  headerRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  logoCircle: { width: 44, height: 44, borderRadius: 22, borderColor:  Colors.light.secondary, backgroundColor: '#ffff', alignItems: 'center', justifyContent: 'center' },
  logoImage: { width: 35, height: 35 },
  logoText: { color: Colors.light.text, fontWeight: '800' },
  title: { fontSize: Typography.header, fontWeight: '800', color: Colors.light.text },
  sub: { color: Colors.light.mutedText },

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
  label: { fontWeight: '700', color: Colors.light.text },
  input: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.secondary,
    borderRadius: Radii.input,
    padding: Spacing.sm,
    color: Colors.light.text,
  },

  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#EAF6FF',
    borderRadius: Radii.card,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: '#BFDFFF',
  },
  noticeIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#D6ECFF', alignItems: 'center', justifyContent: 'center' },
  noticeIconText: { fontSize: 16 },
  noticeTitle: { fontWeight: '700', color: Colors.light.text },
  noticeText: { color: Colors.light.mutedText, marginTop: 2 },

  primary: { marginTop: Spacing.sm,backgroundColor: Colors.light.primary, borderRadius: Radii.button, paddingVertical: Spacing.sm, alignItems: 'center', minHeight: 44 },
  primaryText: { color: Colors.light.onAccent, fontWeight: '800' },

  infoBox: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.md,
  },
  infoTitle: { fontWeight: '800', color: Colors.light.text },
  infoText: { marginTop: Spacing.xs, color: Colors.light.mutedText },
});