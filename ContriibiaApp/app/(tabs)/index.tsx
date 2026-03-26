import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIcon from '../../components/AppIcon';
import Logo from '../../components/Logo';
import { Colors } from '../../constants/Colors';
import { getWallet, getTransactions } from '@/src/services/walletService';
import { getCurrentProfile } from '@/src/services/profileService';

const QUICK_ACTIONS = [
  { icon: 'group-add', label: 'Join Club' },
  { icon: 'send', label: 'Send' },
  { icon: 'download', label: 'Receive' },
  { icon: 'receipt-long', label: 'History' },
];

type Tx = {
  id: string;
  amount: number;
  type: 'deposit' | 'withdraw';
  created_at: string;
};

export default function HomeScreen() {
  const [fullName, setFullName] = useState('User');
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [loadingText, setLoadingText] = useState('Loading...');

  const loadHomeData = async () => {
    const profileRes = await getCurrentProfile();
    const walletRes = await getWallet();
    const txRes = await getTransactions();

    if (profileRes.success && profileRes.data) {
      setFullName(profileRes.data.full_name || 'User');
    }

    if (walletRes.success && walletRes.data) {
      setBalance(Number(walletRes.data.balance));
    }

    if (txRes.success && txRes.data) {
      setTransactions(txRes.data as Tx[]);
    }

    setLoadingText('');
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const firstName = fullName.split(' ')[0] || 'User';

  const totalDeposits = transactions
    .filter((item) => item.type === 'deposit')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const totalWithdrawals = transactions
    .filter((item) => item.type === 'withdraw')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const recentTransactions = transactions.slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Logo size="small" />
          <View style={styles.headerRight}>
            <Text style={styles.welcomeText}>Hi, {firstName}</Text>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Savings</Text>
          <Text style={styles.balanceAmount}>
            {loadingText ? loadingText : `$${balance.toFixed(2)}`}
          </Text>
          <Text style={styles.balanceSub}>Your current wallet balance</Text>
        </View>

        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity key={action.label} style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <AppIcon name={action.icon} size={22} color={Colors.primary} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>

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

        <Text style={styles.sectionTitle}>Recent Activity</Text>

        {recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <AppIcon name="account-balance-wallet" size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptyDesc}>
              Your recent wallet activity will appear here.
            </Text>
          </View>
        ) : (
          recentTransactions.map((item) => (
            <View key={item.id} style={styles.transactionCard}>
              <View style={styles.transactionTop}>
                <Text style={styles.transactionType}>
                  {item.type.toUpperCase()}
                </Text>
                <Text style={styles.transactionAmount}>
                  ${Number(item.amount).toFixed(2)}
                </Text>
              </View>
              <Text style={styles.transactionDate}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Your Savings Clubs</Text>

        <View style={styles.emptyState}>
          <AppIcon name="groups" size={48} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>No clubs yet</Text>
          <Text style={styles.emptyDesc}>
            Join or create a savings club to get started.
          </Text>
          <TouchableOpacity style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Join a Club</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  balanceCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 4,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  balanceAmount: {
    color: Colors.white,
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
  },
  balanceSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  quickActionEmoji: {
    fontSize: 22,
  },
  quickActionLabel: {
    fontSize: 12,
    color: Colors.textMid,
    fontWeight: '500',
  },
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 15,
    color: Colors.textMid,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
  },
  transactionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 10,
  },
  transactionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.textMid,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textDark,
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.textMid,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});
