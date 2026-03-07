import React, { useEffect, useState } from 'react';
import { Redirect, Stack } from 'expo-router';
import { supabase } from '@/src/lib/supabaseClient';

export default function AuthLayout() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSignedIn(!!data.session);
      setLoading(false);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) return null;

  if (signedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}