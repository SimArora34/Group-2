import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

type WalletProvider = 'apple' | 'google' | null;

function VirtualCard({ business }: { business?: boolean }) {
  return (
    <View style={[styles.card, business && styles.cardBusiness]}>
      <View style={styles.cardTop}>
        <View style={styles.cardLockRow}>
          <Ionicons name="lock-closed" size={14} color="rgba(255,255,255,0.7)" />
          <Text style={styles.cardTopText}>•••• •••• •••• 9018</Text>
        </View>
        {business && (
          <View style={styles.businessBadge}>
            <Text style={styles.businessBadgeText}>B</Text>
          </View>
        )}
      </View>
      <Text style={styles.cardName}>{business ? 'BUSINESS ACCOUNT' : 'HITARTH PATEL'}</Text>
      <Text style={styles.cardExpiry}>EXPIRES: MM/YY  CVV</Text>
      <View style={styles.cardBalanceRow}>
        <View>
          <Text style={styles.cardBalanceLabel}>Current Balance</Text>
          <Text style={styles.cardBalanceAmt}>$X,XXX</Text>
        </View>
        <Ionicons name="eye-off-outline" size={20} color="rgba(255,255,255,0.7)" />
      </View>
    </View>
  );
}

export default function TapToPayScreen() {
  const [provider, setProvider] = useState<WalletProvider>(null);

  if (provider) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <VirtualCard />

          <View style={styles.nfcWrap}>
            <View style={styles.nfcCircle}>
              <Ionicons name="phone-portrait-outline" size={44} color={Colors.primary} />
              <View style={styles.nfcRing1} />
              <View style={styles.nfcRing2} />
            </View>
            <Text style={styles.nfcLabel}>Hold Near Reader</Text>
          </View>

          <Text style={styles.providerNote}>
            Your Contribiia card has been added to{' '}
            <Text style={styles.bold}>
              {provider === 'apple' ? 'Apple Wallet' : 'Google Wallet'}.
            </Text>
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <VirtualCard />

        <TouchableOpacity
          style={styles.walletBtn}
          onPress={() => setProvider('apple')}
        >
          <Ionicons name="logo-apple" size={22} color={Colors.textDark} />
          <Text style={styles.walletBtnText}>Setup with Apple Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.walletBtn}
          onPress={() => setProvider('google')}
        >
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

  // Card
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

  // Wallet buttons
  walletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  walletBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textDark },

  // Google icon
  googleIcon: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#4285F4',
    alignItems: 'center', justifyContent: 'center',
  },
  googleG: { color: Colors.white, fontSize: 13, fontWeight: '800' },

  // NFC state
  nfcWrap: { alignItems: 'center', paddingVertical: 16, gap: 16 },
  nfcCircle: {
    width: 100, height: 100,
    alignItems: 'center', justifyContent: 'center',
  },
  nfcRing1: {
    position: 'absolute',
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2, borderColor: Colors.primary,
    opacity: 0.3,
  },
  nfcRing2: {
    position: 'absolute',
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 2, borderColor: Colors.primary,
    opacity: 0.15,
  },
  nfcLabel: { fontSize: 16, fontWeight: '600', color: Colors.textDark },

  providerNote: { fontSize: 14, color: Colors.textMid, lineHeight: 22, textAlign: 'center' },
  bold: { fontWeight: '700', color: Colors.textDark },

  doneBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },

  disclaimer: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});
