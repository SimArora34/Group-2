import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { getTransactions } from '@/src/services/walletService';

type Tx = {
  id: string;
  amount: number;
  type: 'deposit' | 'withdraw';
  created_at: string;
};

function TxItem({ item }: { item: Tx }) {
  const isDeposit = item.type === 'deposit';
  return (
    <View style={styles.txCard}>
      <View style={[styles.txIconWrap, isDeposit ? styles.txIconDeposit : styles.txIconWithdraw]}>
        <Ionicons
          name={isDeposit ? 'arrow-down' : 'arrow-up'}
          size={18}
          color={isDeposit ? Colors.success : Colors.error}
        />
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txType}>{isDeposit ? 'Deposit' : 'Withdrawal'}</Text>
        <Text style={styles.txDate}>{new Date(item.created_at).toLocaleString()}</Text>
      </View>
      <Text style={[styles.txAmount, isDeposit ? styles.txAmountDeposit : styles.txAmountWithdraw]}>
        {isDeposit ? '+' : '-'}${Number(item.amount).toFixed(2)}
      </Text>
    </View>
  );
}

export default function TransactionHistoryScreen() {
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions().then((res) => {
      if (res.success && res.data) {
        setTransactions(res.data as Tx[]);
      }
      setLoading(false);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TxItem item={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptyDesc}>Your transaction history will appear here.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loader: {
    flex: 1,
  },
  list: {
    padding: 20,
    gap: 10,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 12,
  },
  txIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txIconDeposit: {
    backgroundColor: '#E8F5E9',
  },
  txIconWithdraw: {
    backgroundColor: '#FFEBEE',
  },
  txInfo: {
    flex: 1,
    gap: 2,
  },
  txType: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textDark,
  },
  txDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  txAmountDeposit: {
    color: Colors.success,
  },
  txAmountWithdraw: {
    color: Colors.error,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.textMid,
    textAlign: 'center',
  },
});
