import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Logo from '../../components/Logo';
import { Colors } from '../../constants/Colors';

export default function SignupScreen() {
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleCreate = () => {
    const { name, username, email, phone, password, confirmPassword } = form;
    if (!name || !username || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (!agreed) {
      Alert.alert('Error', 'Please agree to the Terms & Conditions');
      return;
    }
    setLoading(true);
    // Mock registration
    setTimeout(() => {
      setLoading(false);
      router.replace('/(verification)/setup-overview');
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logoRow}>
          <Logo size="large" showTagline />
        </View>

        <Text style={styles.heading}>Create account</Text>

        <Input label="Name" placeholder="Saver Smith" value={form.name} onChangeText={set('name')} required />
        <Input label="Username" placeholder="Saver Smith" value={form.username} onChangeText={set('username')} required />
        <Input
          label="Email address"
          placeholder="saver@contribiia.com"
          value={form.email}
          onChangeText={set('email')}
          keyboardType="email-address"
          autoCapitalize="none"
          required
        />
        <Input
          label="Phone number"
          placeholder="+1 5555 555 555"
          value={form.phone}
          onChangeText={set('phone')}
          keyboardType="phone-pad"
          required
        />
        <Input
          label="Password"
          placeholder="Enter password"
          value={form.password}
          onChangeText={set('password')}
          secureTextEntry
          required
        />
        <Input
          label="Confirm password"
          placeholder="Re-type password"
          value={form.confirmPassword}
          onChangeText={set('confirmPassword')}
          secureTextEntry
          required
        />

        <View style={styles.checkRow}>
          <TouchableOpacity
            style={[styles.checkbox, agreed && styles.checkboxChecked]}
            onPress={() => setAgreed((v) => !v)}
          >
            {agreed && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          <Text style={styles.checkLabel}>
            I agree to Contribiia's{' '}
            <Text style={styles.link} onPress={() => router.push('/(auth)/terms')}>
              Terms & Conditions.
            </Text>
          </Text>
        </View>

        <Button label="Create Account" onPress={handleCreate} loading={loading} disabled={!agreed} style={styles.ctaButton} />

        <Text style={styles.bottomText}>
          Already have an account?{' '}
          <Text style={styles.link} onPress={() => router.replace('/(auth)/login')}>
            Log In
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scroll: {
    padding: 24,
    flexGrow: 1,
  },
  logoRow: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 20,
    textAlign: 'center',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 20,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  checkLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.textMid,
    lineHeight: 20,
  },
  link: {
    color: Colors.accent,
    fontWeight: '600',
  },
  ctaButton: {
    marginBottom: 8,
  },
  bottomText: {
    textAlign: 'center',
    color: Colors.textMid,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
  },
});
