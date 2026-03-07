import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { deposit, getTransactions, getWallet, withdraw } from '@/src/services/walletService';

type Tx = {
  id: string;
  amount: number;
  type: 'deposit' | 'withdraw';
  created_at: string;
};

export default function WalletScreen() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadWallet = async () => {
    setMessage('');

    const walletRes = await getWallet();
    const txRes = await getTransactions();

    if (walletRes.success && walletRes.data) {
      setBalance(Number(walletRes.data.balance));
    }

    if (txRes.success && txRes.data) {
      setTransactions(txRes.data as Tx[]);
    }

    if (!walletRes.success) {
      setMessage(walletRes.error || 'Failed to load wallet');
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const handleDeposit = async () => {
    setLoading(true);

    const res = await deposit(10);

    if (!res.success) {
      setLoading(false);
      Alert.alert('Deposit Failed', res.error || 'Something went wrong');
      return;
    }

    await loadWallet();
    setLoading(false);
    setMessage('Deposit successful');
  };

  const handleWithdraw = async () => {
    setLoading(true);

    const res = await withdraw(5);

    if (!res.success) {
      setLoading(false);
      Alert.alert('Withdraw Failed', res.error || 'Something went wrong');
      return;
    }

    await loadWallet();
    setLoading(false);
    setMessage('Withdrawal successful');
  };

  const totalDeposits = transactions
    .filter((item) => item.type === 'deposit')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const totalWithdrawals = transactions
    .filter((item) => item.type === 'withdraw')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Wallet</Text>
        <Text style={styles.balance}>${balance.toFixed(2)}</Text>

        {!!message && <Text style={styles.message}>{message}</Text>}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.depositButton]}
            onPress={handleDeposit}
            disabled={loading}
          >
            <Text style={styles.depositButtonText}>
              {loading ? 'Processing...' : 'Deposit $10'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.withdrawButton]}
            onPress={handleWithdraw}
            disabled={loading}
          >
            <Text style={styles.withdrawButtonText}>
              {loading ? 'Processing...' : 'Withdraw $5'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Quick Stats</Text>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Deposits</Text>
            <Text style={styles.statValue}>${totalDeposits.toFixed(2)}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Withdrawals</Text>
            <Text style={styles.statValue}>${totalWithdrawals.toFixed(2)}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Current Balance</Text>
            <Text style={styles.statValue}>${balance.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Transactions</Text>

        {transactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No transactions yet.</Text>
          </View>
        ) : (
          transactions.map((item) => (
            <View key={item.id} style={styles.transactionCard}>
              <Text style={styles.transactionType}>
                {item.type.toUpperCase()}
              </Text>
              <Text style={styles.transactionAmount}>
                ${Number(item.amount).toFixed(2)}
              </Text>
              <Text style={styles.transactionDate}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </View>
          ))
        )}
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
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textDark,
  },
  balance: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.textDark,
    marginTop: 6,
  },
  message: {
    color: 'green',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  depositButton: {
    backgroundColor: Colors.primary,
  },
  withdrawButton: {
    backgroundColor: Colors.border,
  },
  depositButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  withdrawButtonText: {
    color: Colors.textDark,
    fontSize: 16,
    fontWeight: '700',
  },
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 16,
    color: Colors.textMid,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
    marginTop: 12,
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 20,
    backgroundColor: Colors.surface,
  },
  emptyText: {
    color: Colors.textMid,
    fontSize: 14,
    textAlign: 'center',
  },
  transactionCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 16,
    backgroundColor: Colors.surface,
    marginTop: 10,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  transactionAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textDark,
    marginTop: 8,
  },
  transactionDate: {
    fontSize: 13,
    color: Colors.textMid,
    marginTop: 8,
  },
});