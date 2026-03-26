import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { getWallet } from '@/src/services/walletService';

export default function SendMoneyScreen() {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [amountError, setAmountError] = useState('');
  const [recipientError, setRecipientError] = useState('');

  useEffect(() => {
    getWallet().then((res) => {
      if (res.success && res.data) setBalance(Number(res.data.balance));
    });
  }, []);

  const handleContinue = () => {
    let valid = true;
    if (!amount || parseFloat(amount) <= 0) {
      setAmountError('Please enter a valid amount.');
      valid = false;
    } else {
      setAmountError('');
    }
    if (!recipient.trim()) {
      setRecipientError('Please enter a recipient email or username.');
      valid = false;
    } else {
      setRecipientError('');
    }
    if (!valid) return;

    router.push({
      pathname: '/(wallet)/confirm-send',
      params: { amount: parseFloat(amount).toFixed(2), recipient: recipient.trim() },
    } as any);
  };

  const handleClearAmount = () => setAmount('');

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Current Balance:</Text>
            <Text style={styles.balanceVal}>
              {balance !== null ? `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '...'}
            </Text>
          </View>

          <Text style={styles.fieldLabel}>Enter Amount</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex, !!amountError && styles.inputError]}
              value={amount}
              onChangeText={(v) => { setAmount(v); setAmountError(''); }}
              placeholder="$0.00"
              placeholderTextColor={Colors.textPlaceholder}
              keyboardType="decimal-pad"
            />
            {!!amount && (
              <TouchableOpacity style={styles.clearBtn} onPress={handleClearAmount}>
                <Ionicons name="close-circle" size={20} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          {!!amountError && <Text style={styles.errorText}>{amountError}</Text>}

          <Text style={styles.fieldLabel}>Receiver:</Text>
          <TextInput
            style={[styles.input, !!recipientError && styles.inputError]}
            value={recipient}
            onChangeText={(v) => { setRecipient(v); setRecipientError(''); }}
            placeholder="Enter username or email address"
            placeholderTextColor={Colors.textPlaceholder}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {!!recipientError && <Text style={styles.errorText}>{recipientError}</Text>}

          <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, gap: 12 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  balanceLabel: { fontSize: 15, fontWeight: '600', color: Colors.textDark },
  balanceVal: { fontSize: 15, fontWeight: '700', color: Colors.textDark },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  inputFlex: { flex: 1 },
  clearBtn: { position: 'absolute', right: 12 },
  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 13, fontSize: 16, color: Colors.textDark,
    width: '100%',
  },
  inputError: { borderColor: Colors.error },
  errorText: { fontSize: 12, color: Colors.error, marginTop: -4 },
  continueBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  continueBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
});
