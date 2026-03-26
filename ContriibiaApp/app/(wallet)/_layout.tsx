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
    />
  );
}
