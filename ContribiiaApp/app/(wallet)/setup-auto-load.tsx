import { router } from 'expo-router';
import React, { useState } from 'react';
import AppIcon from '../../components/AppIcon';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

export default function SetupAutoLoadScreen() {
  const [amount, setAmount] = useState('');
  const [threshold, setThreshold] = useState('');
  const [method, setMethod] = useState<'card' | 'bank' | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const parsedAmount = parseFloat(amount);
  const parsedThreshold = parseFloat(threshold);
  const last4 = '9018';

  const handleSetup = async () => {
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter a valid load amount.');
      return;
    }

    if (!parsedThreshold || parsedThreshold <= 0) {
      setError('Please enter a valid minimum threshold.');
      return;
    }

    if (!method) {
      setError('Please choose a payment method.');
      return;
    }

    setError('');
    setLoading(true);

    await new Promise((r) => setTimeout(r, 800));

    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.successWrap}>
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Auto-Load Activated!</Text>
          </View>

          <View style={styles.successIcon}>
            <AppIcon name="checkmark" size={44} color={Colors.white} />
          </View>

          <Text style={styles.congratsTitle}>Congratulations!</Text>
          <Text style={styles.congratsDesc}>
            Your account will automatically load{' '}
            <Text style={styles.bold}>${parsedAmount.toFixed(2)}</Text>{' '}
            when your balance drops below{' '}
            <Text style={styles.bold}>${parsedThreshold.toFixed(2)}</Text>{' '}
            using **** **** **** {last4}
          </Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.replace('/(wallet)/more' as any)}
          >
            <Text style={styles.primaryBtnText}>View More Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => router.replace('/(tabs)/wallet' as any)}
          >
            <Text style={styles.outlineBtnText}>Go Back to App Wallet</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {!!error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.fieldLabel}>Enter Amount</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={(v) => {
              setAmount(v);
              setError('');
            }}
            placeholder="$0.00"
            placeholderTextColor={Colors.textPlaceholder}
            keyboardType="decimal-pad"
          />

          <Text style={styles.fieldLabel}>
            Minimum Threshold <Text style={styles.fieldHint}>(When balance drops to:)</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={threshold}
            onChangeText={(v) => {
              setThreshold(v);
              setError('');
            }}
            placeholder="$0.00"
            placeholderTextColor={Colors.textPlaceholder}
            keyboardType="decimal-pad"
          />

          <Text style={styles.fieldLabel}>Pay By</Text>

          <TouchableOpacity
            style={[styles.payOption, method === 'card' && styles.payOptionActive]}
            onPress={() => setMethod('card')}
          >
            <Text style={styles.payOptionText}>Credit / Debit Card</Text>
            <AppIcon name="card-outline" size={18} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.payOption, method === 'bank' && styles.payOptionActive]}
            onPress={() => setMethod('bank')}
          >
            <Text style={styles.payOptionText}>Bank Account Details</Text>
            <AppIcon name="business-outline" size={18} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.setupBtn, loading && { opacity: 0.6 }]}
            onPress={handleSetup}
            disabled={loading}
          >
            <Text style={styles.setupBtnText}>{loading ? 'Setting up...' : 'Setup'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, gap: 12 },
  errorBanner: { backgroundColor: '#FEE2E2', borderRadius: 8, padding: 12 },
  errorText: { color: '#DC2626', fontSize: 13 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  fieldHint: { fontSize: 12, fontWeight: '400', color: Colors.textLight },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    color: Colors.textDark,
    backgroundColor: Colors.white,
  },
  payOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  payOptionActive: {
    backgroundColor: Colors.primaryDark,
  },
  payOptionText: { color: Colors.white, fontSize: 15, fontWeight: '500' },
  setupBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  setupBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  successWrap: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center', gap: 18 },
  banner: {
    backgroundColor: Colors.primary,
    width: '100%',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  bannerText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  successIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  congratsTitle: { fontSize: 28, fontWeight: '800', color: Colors.textDark },
  congratsDesc: {
    fontSize: 15,
    color: Colors.textMid,
    textAlign: 'center',
    lineHeight: 22,
  },
  bold: { fontWeight: '700', color: Colors.textDark },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  primaryBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  outlineBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 16 },
});