import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import { Colors } from '../../constants/Colors';
import { supabase } from '@/src/lib/supabaseClient';

export default function EmailSentScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
    });
    setResending(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Email Sent', 'A new confirmation email has been sent.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoRow}>
          <Logo size="large" showTagline />
        </View>

        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>✉️</Text>
        </View>

        <Text style={styles.heading}>Check your email</Text>
        <Text style={styles.subheading}>
          We sent a confirmation link to{' '}
          <Text style={styles.emailBold}>{email || 'your email'}</Text>.{'\n\n'}
          Click the link in the email to confirm your account, then come back
          here to continue setting up your Contribiia account.
        </Text>

        <View style={styles.stepsBox}>
          <Text style={styles.stepsTitle}>What's next?</Text>
          <View style={styles.step}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>1</Text>
            </View>
            <Text style={styles.stepText}>Open the email from Contribiia</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>2</Text>
            </View>
            <Text style={styles.stepText}>Click "Confirm your email"</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              Return here and log in to complete your profile setup
            </Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <Button
          label="Continue to Login"
          onPress={() =>
            router.replace({
              pathname: '/(auth)/login',
              params: { prefillEmail: email ?? '' },
            })
          }
        />

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn't receive an email? </Text>
          <TouchableOpacity onPress={handleResend} disabled={resending}>
            <Text style={[styles.resendLink, resending && styles.resendDisabled]}>
              {resending ? 'Sending…' : 'Resend'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: 24, flexGrow: 1 },
  logoRow: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconText: { fontSize: 36 },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 12,
  },
  subheading: {
    fontSize: 14,
    color: Colors.textMid,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  emailBold: { fontWeight: '700', color: Colors.textDark },
  stepsBox: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    gap: 14,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 4,
  },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumText: { fontSize: 12, fontWeight: '700', color: Colors.white },
  stepText: { flex: 1, fontSize: 14, color: Colors.textMid, lineHeight: 20 },
  spacer: { flex: 1, minHeight: 40 },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: { fontSize: 14, color: Colors.textMid },
  resendLink: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  resendDisabled: { color: Colors.disabled },
});
