import { Stack } from 'expo-router';
import React from 'react';
import { Colors } from '../../constants/Colors';

export default function WalletLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.textDark,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="add-money" options={{ title: 'Add money' }} />
      <Stack.Screen name="withdraw-money" options={{ title: 'Withdraw Money' }} />
      <Stack.Screen name="confirmation" options={{ title: 'Confirmation', headerLeft: () => null }} />
      <Stack.Screen name="add-new-card" options={{ title: 'Add new card' }} />
      <Stack.Screen name="setup-auto-load" options={{ title: 'Setup Auto Load' }} />
      <Stack.Screen name="send-money" options={{ title: 'Send Money' }} />
      <Stack.Screen name="confirm-send" options={{ title: 'Confirm Transaction' }} />
      <Stack.Screen name="transaction-history" options={{ title: 'Transaction History' }} />
      <Stack.Screen name="generate-invoice" options={{ title: 'Invoice Generator' }} />
      <Stack.Screen name="invoice-send-user" options={{ title: 'Invoice Generator' }} />
      <Stack.Screen name="biometrics" options={{ title: 'App Wallet' }} />
      <Stack.Screen name="more" options={{ title: 'More' }} />
      <Stack.Screen name="qr-code" options={{ title: 'App Wallet' }} />
    </Stack>
  );
}
