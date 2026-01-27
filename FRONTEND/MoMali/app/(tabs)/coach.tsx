import { View, Text, StyleSheet } from 'react-native';

export default function Coach() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coach</Text>
      <Text style={styles.subtitle}>Money advice, tailored for you.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { marginTop: 8, opacity: 0.7 },
});
