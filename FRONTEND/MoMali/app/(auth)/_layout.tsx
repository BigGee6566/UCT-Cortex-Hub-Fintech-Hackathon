import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="loader">
      <Stack.Screen name="loader" />
      <Stack.Screen name="splash" />
      <Stack.Screen name="onboarding-carousel" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="questionnaire" />
      <Stack.Screen name="consent" />
      <Stack.Screen name="bank-connection" />

    
    </Stack>
  );
}
