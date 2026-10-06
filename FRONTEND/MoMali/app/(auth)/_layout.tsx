import { Stack } from 'expo-router';

export default function AuthLayout() {
  // Login is listed first so signed-out users land on it; onboarding is linked from it.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
