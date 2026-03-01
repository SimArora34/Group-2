import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { Colors } from '../../constants/Colors';

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          borderTopColor: Colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => <TabIcon emoji="🏠" />,
        }}
      />
      <Tabs.Screen
        name="clubs"
        options={{
          title: 'Clubs',
          tabBarIcon: () => <TabIcon emoji="👥" />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: () => <TabIcon emoji="👛" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: () => <TabIcon emoji="👤" />,
        }}
      />
    </Tabs>
  );
}
