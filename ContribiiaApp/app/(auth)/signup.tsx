import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Logo from '../../components/Logo';
import { Colors } from '../../constants/Colors';
import { signUp } from '@/src/services/authService';
import {
  CANADA_PHONE_REGEX,
  PASSWORD_REGEX,
  formatPhoneNumber,
} from '@/src/utils/validation';

type FormErrors = {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

export default function SignupScreen() {
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const setPhone = (val: string) => {
    setForm((prev) => ({ ...prev, phone: formatPhoneNumber(val) }));
    setErrors((prev) => ({ ...prev, phone: undefined }));
  };

  const handleCreate = async () => {
    const { name, username, email, phone, password, confirmPassword } = form;
    const newErrors: FormErrors = {};

    if (!name) newErrors.name = 'Name is required';
    if (!username) newErrors.username = 'Username is required';
    if (!email) newErrors.email = 'Email is required';
    if (!phone) newErrors.phone = 'Phone number is required';
    if (!password) newErrors.password = 'Password is required';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';

    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (phone && !CANADA_PHONE_REGEX.test(phone)) {
      newErrors.phone = 'Use format (555) 555-5555';
    }

    if (password && !PASSWORD_REGEX.test(password)) {
      newErrors.password =
        'Use 8+ chars with uppercase, lowercase, number, and symbol';
    }

    if (!agreed) {
      newErrors.general = 'You must agree to the Terms & Conditions';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const result = await signUp(email.trim(), password, name.trim(), username.trim(), phone.trim());

      setLoading(false);

      if (!result.success) {
        setErrors({ general: result.error || 'Something went wrong' });
        return;
      }

      if (!result.data?.hasSession) {
        // Email confirmation is required — send user to the email-sent screen.
        router.replace({
          pathname: '/(auth)/email-sent',
          params: { email: form.email.trim() },
        });
        return;
      }

      router.replace('/(verification)/setup-overview');
    } catch (e) {
      setLoading(false);
      console.error('Signup error:', e);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logoRow}>
          <Logo size="large" showTagline />
        </View>

        <Text style={styles.heading}>Create account</Text>

        {!!errors.general && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errors.general}</Text>
          </View>
        )}

        <Input label="Name" placeholder="Saver Smith" value={form.name} onChangeText={set('name')} required error={errors.name} />
        <Input label="Username" placeholder="saversmith" value={form.username} onChangeText={set('username')} required error={errors.username} />
        <Input
          label="Email address"
          placeholder="saver@contribiia.com"
          value={form.email}
          onChangeText={set('email')}
          keyboardType="email-address"
          autoCapitalize="none"
          required
          error={errors.email}
        />
        <Input
          label="Phone number"
          placeholder="(555) 555-5555"
          value={form.phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          required
          error={errors.phone}
        />
        <Input
          label="Password"
          placeholder="Enter password"
          value={form.password}
          onChangeText={set('password')}
          secureTextEntry
          required
          error={errors.password}
        />
        <Input
          label="Confirm password"
          placeholder="Re-type password"
          value={form.confirmPassword}
          onChangeText={set('confirmPassword')}
          secureTextEntry
          required
          error={errors.confirmPassword}
        />

        <View style={styles.checkRow}>
          <TouchableOpacity
            style={[styles.checkbox, agreed && styles.checkboxChecked]}
            onPress={() => setAgreed((v) => !v)}
          >
            {agreed && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          <Text style={styles.checkLabel}>
            I agree to Contribiia{"'"}s{" "}
            <Text style={styles.link} onPress={() => router.push('/(auth)/terms')}>
              Terms & Conditions.
            </Text>
          </Text>
        </View>

        <Button
          label="Create Account"
          onPress={handleCreate}
          loading={loading}
          style={styles.ctaButton}
        />

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
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  errorBannerText: {
    color: '#DC2626',
    fontSize: 14,
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
