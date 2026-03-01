import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Logo from '../../components/Logo';
import { Colors } from '../../constants/Colors';

export default function SetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in both fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/(auth)/password-success');
    }, 700);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logoRow}>
          <Logo size="large" showTagline />
        </View>

        <Text style={styles.heading}>Set a new Password</Text>
        <Text style={styles.subheading}>
          Create a new password. Ensure it differs from previous ones for security.
        </Text>

        <Input
          label="Password"
          placeholder="Enter new password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Input
          label="Confirm Password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <View style={styles.spacer} />
        <Button label="Update Password" onPress={handleUpdate} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: 24, flexGrow: 1 },
  logoRow: { alignItems: 'center', marginBottom: 32, marginTop: 8 },
  heading: { fontSize: 22, fontWeight: '700', color: Colors.textDark, marginBottom: 8, textAlign: 'center' },
  subheading: { fontSize: 14, color: Colors.textMid, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  spacer: { flex: 1, minHeight: 40 },
});
