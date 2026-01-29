import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Colors, Radii, Spacing, Typography } from '@/constants/theme';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      {/* <Image
        source={require('@/assets/images/splash.png')}
        style={styles.splashImage}
        contentFit="contain"
        accessibilityLabel="MoMali splash illustration"
      /> */}
      <Image
        source={require('@/assets/images/logo.png')}
        style={styles.logoImage}
        contentFit="contain"
        accessibilityLabel="MoMali logo"
      />
      <Text style={styles.tagline}>Your Money, Your Control</Text>

      <View style={styles.badges}>
        <Text style={styles.badge}>No hidden fees</Text>
        <Text style={styles.badge}>Your data is safe</Text>
        <Text style={styles.badge}>Free forever</Text>
      </View>

      <View style={{ height: 14 }} />
      <PrimaryButton label="Get Started" onPress={() => router.push('/(auth)/onboarding-carousel')} />
      <View style={{ height: 10 }} />
      <PrimaryButton label="Login" variant="ghost" onPress={() => router.push('/(auth)/login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background, justifyContent: 'center', padding: Spacing.lg, gap: Spacing.sm },
  splashImage: { width: '100%', height: 180, borderRadius: Radii.card },
  logoImage: { width: 380, height: 180, alignSelf: 'center' },
  tagline: { fontSize: Typography.body, fontWeight: '700', color: Colors.light.mutedText, textAlign: 'center' },
  badges: { marginTop: Spacing.sm, gap: Spacing.xs },
  badge: {
    textAlign: 'center',
    paddingVertical: Spacing.xs,
    borderRadius: Radii.pill,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    fontWeight: '700',
    color: Colors.light.mutedText,
  },
});
