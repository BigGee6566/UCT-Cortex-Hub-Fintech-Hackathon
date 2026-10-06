import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function Onboarding() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mo’Mali</Text>
      <Text style={styles.subtitle}>Your money. Your control.</Text>

      <Pressable
        style={styles.button}
        accessibilityRole="button"
        // Onboarding is opened from the login screen, so go back to it rather than stacking a second login.
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/login'))}>
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 34, fontWeight: '800' },
  subtitle: { marginTop: 10, fontSize: 16, opacity: 0.7, textAlign: 'center' },
  button: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, backgroundColor: '#111' },
  buttonText: { color: '#fff', fontWeight: '700' },
});
