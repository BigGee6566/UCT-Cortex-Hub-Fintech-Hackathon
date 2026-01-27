import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function Login() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {/* For now: a fake login button (we’ll add real auth next) */}
      <Pressable style={styles.button} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 26, fontWeight: '800' },
  button: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, backgroundColor: '#111' },
  buttonText: { color: '#fff', fontWeight: '700' },
});
