// MOCK MODE – Supabase auth guard bypassed for client demo
import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
