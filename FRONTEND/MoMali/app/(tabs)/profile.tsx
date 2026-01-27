import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function Profile() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <Pressable style={styles.button} onPress={() => router.replace('/(auth)/login')}>
        <Text style={styles.buttonText}>Log out</Text>
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
