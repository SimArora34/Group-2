import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Logo from '../../components/Logo';
import { Colors } from '../../constants/Colors';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    setLoading(true);
    // Mock: send reset email
    setTimeout(() => {
      setLoading(false);
      router.push({ pathname: '/(auth)/verify-code', params: { email } });
    }, 700);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logoRow}>
          <Logo size="large" showTagline />
        </View>

        <Text style={styles.heading}>Reset Password</Text>
        <Text style={styles.subheading}>Please enter your email to reset the password</Text>

        <Input
          label="Email address"
          placeholder="saver@contribiia.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.spacer} />
        <Button label="Continue" onPress={handleContinue} loading={loading} />

        <Text style={styles.bottomText}>
          Don't have an account?{' '}
          <Text style={styles.link} onPress={() => router.replace('/(auth)/signup')}>
            Sign Up
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: 24, flexGrow: 1 },
  logoRow: { alignItems: 'center', marginBottom: 32, marginTop: 8 },
  heading: { fontSize: 22, fontWeight: '700', color: Colors.textDark, marginBottom: 6, textAlign: 'center' },
  subheading: { fontSize: 14, color: Colors.textMid, textAlign: 'center', marginBottom: 24 },
  spacer: { flex: 1, minHeight: 32 },
  bottomText: { textAlign: 'center', color: Colors.textMid, fontSize: 14, marginTop: 16 },
  link: { color: Colors.primary, fontWeight: '600' },
});
