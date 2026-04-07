import { Stack } from "expo-router";
import React from "react";

export default function WalletLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="add-money" />
      <Stack.Screen name="withdraw-money" />
      <Stack.Screen name="confirmation" />
      <Stack.Screen name="add-new-card" />
      <Stack.Screen name="setup-auto-load" />
      <Stack.Screen name="send-money" />
      <Stack.Screen name="confirm-send" />
      <Stack.Screen name="transaction-history" />
      <Stack.Screen name="generate-invoice" />
      <Stack.Screen name="invoice-send-user" />
      <Stack.Screen name="biometrics" />
      <Stack.Screen name="more" />
      <Stack.Screen name="qr-code" />
      <Stack.Screen name="freeze-card" />
      <Stack.Screen name="view-my-cards" />
      <Stack.Screen name="manage-accounts" />
      <Stack.Screen name="tap-to-pay" />
      <Stack.Screen name="billing-address" />
    </Stack>
  );
}