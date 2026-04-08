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
import { withdraw } from '@/src/services/walletService';

function generateTxId() {
  const n = () => Math.floor(Math.random() * 9000 + 1000);
  return `H${n()} ${n()} ${n()}`;
}

export default function WithdrawMoneyScreen() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'card' | 'bank' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parsed = parseFloat(amount) || 0;

  const handleWithdraw = async () => {
    if (!parsed || parsed <= 0) {
      setError('Enter valid amount');
      return;
    }

    if (!method) {
      setError('Select withdrawal method');
      return;
    }

    setError('');
    setLoading(true);

    const res = await withdraw(parsed);

    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed');
      return;
    }

    router.replace({
      pathname: '/(wallet)/confirmation',
      params: {
        type: 'withdraw',
        amount: parsed.toFixed(2),
        txId: generateTxId(),
      },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <AppIcon name="chevron-back" size={28} color={Colors.textDark} />
            </TouchableOpacity>
            <Text style={styles.title}>Withdraw money</Text>
            <View style={{ width: 28 }} />
          </View>

          <Text style={styles.label}>Enter Amount</Text>

          <TextInput
            style={[styles.input, !!error && styles.inputError]}
            value={amount}
            onChangeText={(v) => {
              setAmount(v);
              setError('');
            }}
            placeholder="$0.00"
            placeholderTextColor={Colors.textPlaceholder}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Withdraw to:</Text>

          <TouchableOpacity
            style={[styles.option, method === 'card' && styles.optionActive]}
            onPress={() => setMethod('card')}
          >
            <Text style={[styles.optionText, method === 'card' && styles.optionTextActive]}>
              Credit / Debit Card
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, method === 'bank' && styles.optionActive]}
            onPress={() => setMethod('bank')}
          >
            <Text style={[styles.optionText, method === 'bank' && styles.optionTextActive]}>
              Bank Account
            </Text>
          </TouchableOpacity>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleWithdraw}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Processing...' : 'Withdraw'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, gap: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
  },
  label: { fontWeight: '600', color: Colors.textDark, fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  inputError: {
    borderColor: Colors.error,
  },
  option: {
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    color: Colors.textDark,
    fontWeight: '600',
  },
  optionTextActive: {
    color: Colors.white,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
  },
  error: {
    color: Colors.error,
  },
});