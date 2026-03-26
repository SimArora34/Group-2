import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../../components/Logo';
import { Colors } from '../../constants/Colors';
import { getCurrentProfile } from '@/src/services/profileService';
import { deposit, getTransactions, getWallet, withdraw } from '@/src/services/walletService';

type Tx = {
  id: string;
  amount: number;
  type: 'deposit' | 'withdraw';
  created_at: string;
};

type WalletTab = 'personal' | 'business';
type AmountModalMode = 'deposit' | 'withdraw' | null;

const QUICK_ACTIONS_PERSONAL = [
  { id: 'send', icon: 'paper-plane-outline' as const, label: 'Send Money' },
  { id: 'qr', icon: 'qr-code-outline' as const, label: 'Generate QR Code' },
  { id: 'history', icon: 'swap-horizontal-outline' as const, label: 'Transaction History' },
  { id: 'more', icon: 'ellipsis-horizontal-outline' as const, label: 'More' },
];

const QUICK_ACTIONS_BUSINESS = [
  { id: 'send', icon: 'paper-plane-outline' as const, label: 'Send Money' },
  { id: 'invoice', icon: 'document-text-outline' as const, label: 'Generate Invoice' },
  { id: 'qr', icon: 'qr-code-outline' as const, label: 'QR Code' },
  { id: 'history', icon: 'swap-horizontal-outline' as const, label: 'Transaction History' },
];

export default function WalletScreen() {
  const [activeTab, setActiveTab] = useState<WalletTab>('personal');
  const [businessSetup, setBusinessSetup] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [fullName, setFullName] = useState('User');
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [amountModal, setAmountModal] = useState<AmountModalMode>(null);
  const [amountInput, setAmountInput] = useState('');

  const loadWallet = async () => {
    const [profileRes, walletRes, txRes] = await Promise.all([
      getCurrentProfile(),
      getWallet(),
      getTransactions(),
    ]);

    if (profileRes.success && profileRes.data) {
      setFullName(profileRes.data.full_name || 'User');
    }
    if (walletRes.success && walletRes.data) {
      setBalance(Number(walletRes.data.balance));
    }
    if (txRes.success && txRes.data) {
      setTransactions(txRes.data as Tx[]);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const handleAmountConfirm = async () => {
    const amount = parseFloat(amountInput);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    setLoading(true);
    setAmountModal(null);
    setAmountInput('');

    const res = amountModal === 'deposit' ? await deposit(amount) : await withdraw(amount);

    if (!res.success) {
      setLoading(false);
      Alert.alert(
        amountModal === 'deposit' ? 'Deposit Failed' : 'Withdraw Failed',
        res.error || 'Something went wrong'
      );
      return;
    }

    await loadWallet();
    setLoading(false);
  };

  const handleQuickAction = (id: string) => {
    switch (id) {
      case 'send':
        router.push('/(wallet)/send-money' as any);
        break;
      case 'qr':
        router.push('/(wallet)/qr-code' as any);
        break;
      case 'history':
        router.push('/(wallet)/transaction-history' as any);
        break;
      case 'invoice':
        router.push('/(wallet)/generate-invoice' as any);
        break;
      case 'more':
        Alert.alert('More', 'Coming soon');
        break;
    }
  };

  const cardLastFour = '0000';
  const nameDisplay = fullName.toUpperCase();
  const actions = activeTab === 'personal' ? QUICK_ACTIONS_PERSONAL : QUICK_ACTIONS_BUSINESS;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Wallet</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Personal / Business Tab */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'personal' && styles.tabActive]}
          onPress={() => setActiveTab('personal')}
        >
          <Text style={[styles.tabText, activeTab === 'personal' && styles.tabTextActive]}>
            Personal
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'business' && styles.tabActive]}
          onPress={() => setActiveTab('business')}
        >
          <Text style={[styles.tabText, activeTab === 'business' && styles.tabTextActive]}>
            Business
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'business' && !businessSetup ? (
          /* ── Business Wallet Setup Prompt ── */
          <View style={styles.setupCard}>
            <Text style={styles.setupTitle}>Setup Business Wallet</Text>
            <Text style={styles.setupDesc}>
              Setting up Business card opens more features to the App Wallet
            </Text>
            {[
              'Another Card for Business Transaction',
              'Generate Invoice',
              'Send Invoices within the app',
              'Business Transactions with history of pending and settled transaction',
            ].map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <Text style={styles.featureDot}>•</Text>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.setupButton}
              onPress={() => router.push('/(wallet)/billing-address' as any)}
            >
              <Text style={styles.setupButtonText}>Start Business Wallet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* ── Wallet Card ── */}
            <View style={[styles.card, activeTab === 'business' && styles.cardBusiness]}>
              <View style={styles.cardTop}>
                <View style={styles.cardLogoWrap}>
                  <Logo size="small" />
                  {activeTab === 'business' && (
                    <View style={styles.businessBadge}>
                      <Text style={styles.businessBadgeText}>B</Text>
                    </View>
                  )}
                </View>
                <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.7)" />
              </View>

              <Text style={styles.cardNumber}>
                •••• •••• •••• {cardLastFour}
              </Text>

              <View style={styles.cardMeta}>
                <View>
                  <Text style={styles.cardLabel}>
                    {activeTab === 'business' ? 'BUSINESS ACCOUNT' : nameDisplay}
                  </Text>
                  <Text style={styles.cardExpiry}>EXPIRES: MM/YY</Text>
                </View>
                <View style={styles.cvvChip}>
                  <Text style={styles.cvvText}>CVV</Text>
                </View>
              </View>

              <View style={styles.cardBalanceRow}>
                <View>
                  <Text style={styles.cardBalanceLabel}>Current Balance</Text>
                  <Text style={styles.cardBalance}>
                    {balanceVisible ? `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setBalanceVisible((v) => !v)}>
                  <Ionicons
                    name={balanceVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color="rgba(255,255,255,0.8)"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Add Money / Withdraw ── */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnPrimary]}
                onPress={() => { setAmountModal('deposit'); setAmountInput(''); }}
                disabled={loading}
              >
                <Text style={styles.actionBtnPrimaryText}>
                  {loading ? 'Processing...' : 'Add money'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnOutline]}
                onPress={() => { setAmountModal('withdraw'); setAmountInput(''); }}
                disabled={loading}
              >
                <Text style={styles.actionBtnOutlineText}>
                  {loading ? 'Processing...' : 'Withdraw'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── Quick Actions Grid ── */}
            <View style={styles.grid}>
              {actions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.gridItem}
                  onPress={() => handleQuickAction(action.id)}
                >
                  <View style={styles.gridIconWrap}>
                    <Ionicons name={action.icon} size={26} color={Colors.primary} />
                  </View>
                  <Text style={styles.gridLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* ── Amount Input Modal ── */}
      <Modal
        visible={amountModal !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setAmountModal(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {amountModal === 'deposit' ? 'Add Money' : 'Withdraw'}
            </Text>
            <Text style={styles.modalSub}>Enter the amount</Text>
            <TextInput
              style={styles.modalInput}
              value={amountInput}
              onChangeText={setAmountInput}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={Colors.textPlaceholder}
              autoFocus
            />
            <TouchableOpacity style={styles.modalConfirm} onPress={handleAmountConfirm}>
              <Text style={styles.modalConfirmText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setAmountModal(null)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 4,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.white,
    borderRadius: 9,
    margin: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textLight,
  },
  tabTextActive: {
    color: Colors.textDark,
    fontWeight: '700',
  },
  scroll: {
    padding: 20,
    gap: 20,
  },
  // ── Card ──
  card: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 22,
    gap: 12,
  },
  cardBusiness: {
    backgroundColor: Colors.primaryDark,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLogoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  businessBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  cardNumber: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardExpiry: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 2,
  },
  cvvChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cvvText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  cardBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
  },
  cardBalanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 2,
  },
  cardBalance: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  // ── Action Buttons ──
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnPrimary: {
    backgroundColor: Colors.primary,
  },
  actionBtnOutline: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  actionBtnPrimaryText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  actionBtnOutlineText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  // ── Quick Actions Grid ──
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    alignItems: 'flex-start',
    gap: 10,
  },
  gridIconWrap: {
    backgroundColor: Colors.primaryLight,
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
  },
  // ── Business Setup Card ──
  setupCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    gap: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  setupTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
  },
  setupDesc: {
    fontSize: 14,
    color: Colors.textMid,
    lineHeight: 20,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  featureDot: {
    color: Colors.primary,
    fontSize: 16,
    lineHeight: 20,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textMid,
    lineHeight: 20,
  },
  setupButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  setupButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  // ── Amount Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    gap: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
  },
  modalSub: {
    fontSize: 14,
    color: Colors.textMid,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 4,
  },
  modalConfirm: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  modalConfirmText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  modalCancel: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalCancelText: {
    color: Colors.textMid,
    fontSize: 15,
  },
});
