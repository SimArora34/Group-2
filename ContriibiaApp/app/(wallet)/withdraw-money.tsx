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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parsed = parseFloat(amount) || 0;

  const handleWithdraw = async () => {
    if (!parsed || parsed <= 0) {
      setError('Please enter a valid amount greater than $0.');
      return;
    }
    setError('');
    setLoading(true);
    const res = await withdraw(parsed);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Withdrawal failed. Please try again.');
      return;
    }
    router.replace({
      pathname: '/(wallet)/confirmation',
      params: { type: 'withdraw', amount: parsed.toFixed(2), txId: generateTxId() },
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

          <Text style={styles.sectionLabel}>Withdraw to:</Text>

          <TouchableOpacity style={styles.payOption}>
            <Text style={styles.payOptionText}>Credit / Debit Card</Text>
            <AppIcon name="chevron-down" size={18} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.payOption}>
            <Text style={styles.payOptionText}>Bank Account Details</Text>
            <AppIcon name="chevron-down" size={18} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.withdrawBtn, loading && { opacity: 0.6 }]}
            onPress={handleWithdraw}
            disabled={loading}
          >
            <Text style={styles.withdrawBtnText}>{loading ? 'Processing...' : 'Withdraw'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.etransferBtn} disabled={loading}>
            <View style={styles.etransferIcon}>
              <AppIcon name="swap-horizontal" size={18} color="#F5A623" />
            </View>
            <Text style={styles.etransferBtnText}>Interac E-Transfer</Text>
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
  withdrawBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  withdrawBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  etransferBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#F5A623',
    borderRadius: 10,
    paddingVertical: 14,
  },
  etransferIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  etransferBtnText: {
    color: '#F5A623',
    fontWeight: '600',
    fontSize: 15,
  },
});
