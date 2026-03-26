// MOCK MODE – Supabase auth guard bypassed for client demo
import { Tabs } from "expo-router";
import React from "react";
import AppIcon from "../../components/AppIcon";
import { Colors } from "../../constants/Colors";

function TabIcon({ name, color }: { name: string; color: string }) {
  return <AppIcon name={name} size={24} color={color} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="DashbaordScreen"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="DashbaordScreen"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <TabIcon name="home-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color }) => (
            <TabIcon name="wallet-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="credit-score"
        options={{
          title: "Credit Score",
          tabBarIcon: ({ color }) => (
            <TabIcon name="speedometer-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <TabIcon name="person-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="clubs"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
