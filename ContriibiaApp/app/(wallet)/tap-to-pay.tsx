import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIcon from '../../components/AppIcon';
import { Colors } from '../../constants/Colors';
import { getCurrentProfile } from '../../src/services/profileService';
import { getWallet } from '../../src/services/walletService';

type WalletProvider = 'apple' | 'google' | null;

function VirtualCard({
  business,
  name,
  balance,
  balanceVisible,
  onToggleBalance,
}: {
  business?: boolean;
  name: string;
  balance: number | null;
  balanceVisible: boolean;
  onToggleBalance: () => void;
}) {
  const formattedBalance =
    balance !== null
      ? `$${balance.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : '—';

  return (
    <View style={[styles.card, business && styles.cardBusiness]}>
      <View style={styles.cardTop}>
        <View style={styles.cardLockRow}>
          <AppIcon name="lock-closed" size={14} color="rgba(255,255,255,0.7)" />
          <Text style={styles.cardTopText}>•••• •••• •••• ••••</Text>
        </View>
        {business && (
          <View style={styles.businessBadge}>
            <Text style={styles.businessBadgeText}>B</Text>
          </View>
        )}
      </View>

      <Text style={styles.cardName}>{name || '—'}</Text>
      <Text style={styles.cardExpiry}>CONTRIBIIA WALLET</Text>

      <View style={styles.cardBalanceRow}>
        <View>
          <Text style={styles.cardBalanceLabel}>Current Balance</Text>
          <Text style={styles.cardBalanceAmt}>
            {balanceVisible ? formattedBalance : '••••••'}
          </Text>
        </View>

        <TouchableOpacity onPress={onToggleBalance}>
          <AppIcon
            name={balanceVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="rgba(255,255,255,0.7)"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function TapToPayScreen() {
  const [provider, setProvider] = useState<WalletProvider>(null);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceVisible, setBalanceVisible] = useState(false);

  useEffect(() => {
    getCurrentProfile().then((res) => {
      if (res.success && res.data) {
        setName((res.data.full_name || res.data.username || '').toUpperCase());
      }
    });

    getWallet().then((res) => {
      if (res.success && res.data) {
        setBalance(Number(res.data.balance));
      }
    });
  }, []);

  if (provider) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <VirtualCard
            name={name}
            balance={balance}
            balanceVisible={balanceVisible}
            onToggleBalance={() => setBalanceVisible((v) => !v)}
          />

          <View style={styles.nfcWrap}>
            <View style={styles.nfcCircle}>
              <AppIcon name="phone-portrait-outline" size={44} color={Colors.primary} />
              <View style={styles.nfcRing1} />
              <View style={styles.nfcRing2} />
            </View>
            <Text style={styles.nfcLabel}>Hold Near Reader</Text>
          </View>

          <Text style={styles.providerNote}>
            Your Contribiia card has been added to{' '}
            <Text style={styles.bold}>
              {provider === 'apple' ? 'Apple Wallet' : 'Google Wallet'}
            </Text>.
            {'\n'}Hold your phone near a contactless reader to pay.
          </Text>

          <TouchableOpacity style={styles.doneBtn} onPress={() => setProvider(null)}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <VirtualCard
          name={name}
          balance={balance}
          balanceVisible={balanceVisible}
          onToggleBalance={() => setBalanceVisible((v) => !v)}
        />

        <TouchableOpacity style={styles.walletBtn} onPress={() => setProvider('apple')}>
          <AppIcon name="logo-apple" size={22} color={Colors.textDark} />
          <Text style={styles.walletBtnText}>Setup with Apple Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.walletBtn} onPress={() => setProvider('google')}>
          <View style={styles.googleIcon}>
            <Text style={styles.googleG}>G</Text>
          </View>
          <Text style={styles.walletBtnText}>Setup with Google Wallet</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Tap & Pay uses NFC technology. Make sure NFC is enabled on your device to use this feature.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, gap: 20 },
  card: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 22,
    gap: 10,
  },
  cardBusiness: { backgroundColor: Colors.primaryDark },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLockRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTopText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, letterSpacing: 1 },
  businessBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessBadgeText: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  cardName: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  cardExpiry: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
  cardBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
    marginTop: 4,
  },
  cardBalanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 2 },
  cardBalanceAmt: { color: Colors.white, fontSize: 26, fontWeight: '800' },
  walletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  walletBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textDark },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: { color: Colors.primary, fontWeight: '800' },
  disclaimer: { fontSize: 13, color: Colors.textMid, lineHeight: 20, textAlign: 'center' },
  nfcWrap: { alignItems: 'center', gap: 16, paddingVertical: 10 },
  nfcCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    position: 'relative',
  },
  nfcRing1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: 'rgba(47,154,165,0.25)',
  },
  nfcRing2: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 2,
    borderColor: 'rgba(47,154,165,0.14)',
  },
  nfcLabel: { fontSize: 16, fontWeight: '700', color: Colors.textDark },
  providerNote: { fontSize: 14, color: Colors.textMid, lineHeight: 22, textAlign: 'center' },
  bold: { fontWeight: '700', color: Colors.textDark },
  doneBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
});