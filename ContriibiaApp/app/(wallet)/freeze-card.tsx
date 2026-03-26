import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { getDefaultCard, updateCard } from '../../src/services/cardService';
import { getWallet } from '../../src/services/walletService';
import { Card } from '../../src/types';

type Step = 'default' | 'freezeSuccess' | 'frozenView' | 'unfreezeSuccess';

function VirtualCard({
  frozen,
  business,
  card,
  balance,
}: {
  frozen?: boolean;
  business?: boolean;
  card: Card | null;
  balance: number | null;
}) {
  const formattedBalance = balance !== null
    ? `$${balance.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '—';

  return (
    <View style={[styles.card, frozen && styles.cardFrozen, business && styles.cardBusiness]}>
      <View style={styles.cardTop}>
        <View style={styles.cardLockRow}>
          <Ionicons name="lock-closed" size={14} color="rgba(255,255,255,0.7)" />
          <Text style={styles.cardTopText}>•••• •••• •••• {card?.last4 ?? '••••'}</Text>
        </View>
        {business && (
          <View style={styles.businessBadge}>
            <Text style={styles.businessBadgeText}>B</Text>
          </View>
        )}
      </View>
      <Text style={styles.cardName}>
        {business ? 'BUSINESS ACCOUNT' : (card?.holder_name?.toUpperCase() ?? '—')}
      </Text>
      <Text style={styles.cardExpiry}>EXPIRES: {card?.expiry ?? 'MM/YY'}</Text>
      <View style={styles.cardBalanceRow}>
        <View>
          <Text style={styles.cardBalanceLabel}>Current Balance</Text>
          <Text style={styles.cardBalanceAmt}>{formattedBalance}</Text>
        </View>
        <Ionicons name="eye-off-outline" size={20} color="rgba(255,255,255,0.7)" />
      </View>
    </View>
  );
}

export default function FreezeCardScreen() {
  const [step, setStep] = useState<Step>('default');
  const [card, setCard] = useState<Card | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    getDefaultCard('personal').then((res) => {
      if (res.success) setCard(res.data ?? null);
    });
    getWallet().then((res) => {
      if (res.success && res.data) setBalance(res.data.balance);
    });
  }, []);

  const handleFreeze = async () => {
    if (card) await updateCard(card.id, { is_frozen: true });
    setStep('freezeSuccess');
  };

  const handleUnfreeze = async () => {
    if (card) await updateCard(card.id, { is_frozen: false });
    setStep('unfreezeSuccess');
  };

  if (step === 'freezeSuccess') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Card Temporarily Frozen!</Text>
          </View>

          <VirtualCard frozen card={card} balance={balance} />

          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={36} color={Colors.white} />
          </View>

          <Text style={styles.successTitle}>Successful!</Text>
          <Text style={styles.successDesc}>
            Your virtual card has been{' '}
            <Text style={styles.bold}>successfully frozen.</Text>
            {'\n\n'}
            It cannot be used for any transactions until you choose to unfreeze it.
            {'\n\n'}
            If this was done in error, you can unfreeze your card anytime from your App Wallet.
          </Text>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep('frozenView')}>
            <Text style={styles.primaryBtnText}>View Frozen Card</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'frozenView') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.frozenNotice}>
            <Text style={styles.frozenNoticeTitle}>This Card is Frozen!</Text>
            <Text style={styles.frozenNoticeText}>Click Unfreeze to activate your card again.</Text>
          </View>

          <VirtualCard frozen card={card} balance={balance} />

          <TouchableOpacity style={styles.unfreezeBtn} onPress={handleUnfreeze}>
            <Text style={styles.unfreezeBtnText}>Unfreeze the Card</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'unfreezeSuccess') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Card Unfrozen!</Text>
          </View>

          <VirtualCard card={card} balance={balance} />

          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={36} color={Colors.white} />
          </View>

          <Text style={styles.successTitle}>Card Active!</Text>
          <Text style={styles.successDesc}>
            Your virtual card is now{' '}
            <Text style={styles.bold}>active.</Text>
            {'\n\n'}
            You can continue using it for purchases, transfers, or any regular transactions.
          </Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.replace('/(tabs)/wallet' as any)}
          >
            <Text style={styles.primaryBtnText}>View App Wallet</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Default state
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            <Text style={styles.bold}>Note:</Text>
            {' '}This will freeze your card, and will also affect any automated or pending payments done by this card.
            {'\n\n'}
            You can still be able to use the Business card.
          </Text>
        </View>

        <VirtualCard card={card} balance={balance} />

        <TouchableOpacity style={styles.freezeBtn} onPress={handleFreeze}>
          <Text style={styles.freezeBtnText}>Freeze the Card</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, gap: 20, alignItems: 'stretch' },

  // Notice
  noticeBox: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  noticeText: { fontSize: 14, color: Colors.textMid, lineHeight: 22 },

  // Card
  card: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 22,
    gap: 10,
  },
  cardFrozen: { backgroundColor: '#9E9E9E' },
  cardBusiness: { backgroundColor: Colors.primaryDark },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLockRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTopText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, letterSpacing: 1 },
  businessBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  businessBadgeText: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  cardName: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  cardExpiry: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
  cardBalanceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 12, marginTop: 4,
  },
  cardBalanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 2 },
  cardBalanceAmt: { color: Colors.white, fontSize: 26, fontWeight: '800' },

  // Frozen notice
  frozenNotice: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCD34D',
    padding: 16,
    gap: 4,
  },
  frozenNoticeTitle: { fontSize: 16, fontWeight: '700', color: '#92400E' },
  frozenNoticeText: { fontSize: 13, color: '#92400E' },

  // Buttons
  freezeBtn: {
    backgroundColor: Colors.error,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  freezeBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  unfreezeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  unfreezeBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },

  // Success state
  banner: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  bannerText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  checkCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.success,
    alignSelf: 'center',
    alignItems: 'center', justifyContent: 'center',
  },
  successTitle: { fontSize: 24, fontWeight: '800', color: Colors.textDark, textAlign: 'center' },
  successDesc: { fontSize: 14, color: Colors.textMid, lineHeight: 22, textAlign: 'center' },
  bold: { fontWeight: '700', color: Colors.textDark },
});
