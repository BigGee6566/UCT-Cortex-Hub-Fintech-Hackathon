import { Stack } from 'expo-router';

export default function QuestionnaireLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="income-sources" />
      <Stack.Screen name="obligations" />
      <Stack.Screen name="spending-habits" />
      <Stack.Screen name="goals" />
    </Stack>
  );
}
