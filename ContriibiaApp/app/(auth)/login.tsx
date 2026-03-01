import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Logo from '../../components/Logo';
import { Colors } from '../../constants/Colors';
import mockData from '../../data/mockData.json';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    // Mock authentication against JSON data
    setTimeout(() => {
      const user = mockData.users.find(
        (u) => u.email === email && u.password === password
      );
      setLoading(false);
      if (user) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', 'Invalid email or password');
      }
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logoRow}>
          <Logo size="large" showTagline />
        </View>

        <Text style={styles.heading}>Welcome back to Contribiia.</Text>

        <Input
          label="Email address"
          placeholder="saver@contribiia.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Password"
          placeholder="Enter password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
          <Text style={styles.forgotLink}>Forgot password?</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />

        <Button label="Login" onPress={handleLogin} loading={loading} />

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
    marginBottom: 32,
    marginTop: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 24,
    textAlign: 'center',
  },
  forgotLink: {
    color: Colors.accent,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  spacer: {
    flex: 1,
    minHeight: 32,
  },
  bottomText: {
    textAlign: 'center',
    color: Colors.textMid,
    fontSize: 14,
    marginTop: 16,
  },
  link: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
