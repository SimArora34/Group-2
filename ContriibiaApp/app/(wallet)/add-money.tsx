import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
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
import { deposit } from '@/src/services/walletService';

const FEE = 0;

function generateTxId() {
  const n = () => Math.floor(Math.random() * 9000 + 1000);
  return `H${n()} ${n()} ${n()}`;
}

export default function AddMoneyScreen() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parsed = parseFloat(amount) || 0;
  const total = parsed + FEE;

  const handleAddMoney = async () => {
    if (!parsed || parsed <= 0) {
      setError('Please enter a valid amount greater than $0.');
      return;
    }
    setError('');
    setLoading(true);
    const res = await deposit(parsed);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Deposit failed. Please try again.');
      return;
    }
    router.replace({
      pathname: '/(wallet)/confirmation',
      params: { type: 'deposit', amount: parsed.toFixed(2), txId: generateTxId() },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <Text style={styles.label}>Enter Amount</Text>
          <TextInput
            style={[styles.amountInput, !!error && styles.amountInputError]}
            value={amount}
            onChangeText={(v) => { setAmount(v); setError(''); }}
            placeholder="$0.00"
            placeholderTextColor={Colors.textPlaceholder}
            keyboardType="decimal-pad"
            autoFocus
          />
          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {parsed > 0 && (
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Amount:</Text>
                <Text style={styles.summaryVal}>${parsed.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Fees:</Text>
                <Text style={styles.summaryVal}>${FEE.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalKey}>Total Amount:</Text>
                <Text style={styles.summaryTotalVal}>${total.toFixed(2)}</Text>
              </View>
            </View>
          )}

          <Text style={styles.sectionLabel}>Pay By</Text>

          <TouchableOpacity style={styles.payOption}>
            <Text style={styles.payOptionText}>Credit / Debit Card</Text>
            <Ionicons name="chevron-down" size={18} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.payOption}>
            <Text style={styles.payOptionText}>Bank Account Details</Text>
            <Ionicons name="chevron-down" size={18} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.autoLoadBtn} onPress={() => router.push('/(wallet)/setup-auto-load' as any)}>
            <Text style={styles.autoLoadBtnText}>Setup Auto Load</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.addMoneyBtn, loading && { opacity: 0.6 }]}
            onPress={handleAddMoney}
            disabled={loading}
          >
            <Text style={styles.addMoneyBtnText}>{loading ? 'Processing...' : 'Add Money'}</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 20,
    gap: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
  },
  amountInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
  },
  amountInputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: -6,
  },
  summaryBox: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryKey: {
    fontSize: 14,
    color: Colors.textMid,
  },
  summaryVal: {
    fontSize: 14,
    color: Colors.textDark,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    marginTop: 4,
  },
  summaryTotalKey: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
  },
  summaryTotalVal: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: 4,
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
  payOptionText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '500',
  },
  autoLoadBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  autoLoadBtnText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  addMoneyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addMoneyBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
