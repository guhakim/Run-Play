import { Stack } from 'expo-router';

export default function RunLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="setup" />
      <Stack.Screen name="active" />
      <Stack.Screen name="finish" />
      <Stack.Screen name="report" />
    </Stack>
  );
}
