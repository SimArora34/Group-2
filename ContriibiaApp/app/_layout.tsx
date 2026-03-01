import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(verification)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
