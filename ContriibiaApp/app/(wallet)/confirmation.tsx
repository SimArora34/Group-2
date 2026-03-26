import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import AppIcon from '../../components/AppIcon';
import { Clipboard, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { getDefaultBankAccount } from '../../src/services/bankAccountService';
import { BankAccount } from '../../src/types';

export default function ConfirmationScreen() {
  const { type, amount, txId } = useLocalSearchParams<{
    type: 'deposit' | 'withdraw';
    amount: string;
    txId: string;
  }>();

  const isDeposit = type === 'deposit';
  const [defaultAccount, setDefaultAccount] = useState<BankAccount | null>(null);

  useEffect(() => {
    if (!isDeposit) {
      getDefaultBankAccount().then((res) => {
        if (res.success && res.data) setDefaultAccount(res.data);
      });
    }
  }, [isDeposit]);

  const handleCopyTxId = () => {
    Clipboard.setString(txId ?? '');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            {isDeposit ? 'Amount Deposited!' : 'Amount withdrawn!'}
          </Text>
        </View>

        <View style={styles.successIcon}>
          <AppIcon name="checkmark" size={44} color={Colors.white} />
        </View>

        <Text style={styles.successTitle}>Successful!</Text>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Transaction number:</Text>
            <View style={styles.txRow}>
              <Text style={styles.detailVal}>{txId}</Text>
              <TouchableOpacity onPress={handleCopyTxId} style={styles.copyBtn}>
                <AppIcon name="copy-outline" size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Amount :</Text>
            <Text style={styles.detailVal}>${amount}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailKeySmall}>To</Text>
          </View>
          {isDeposit ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Contribiia Wallet</Text>
            </View>
          ) : (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>
                  {defaultAccount ? `AC No: ${defaultAccount.account_number}` : 'Personal Bank Account'}
                </Text>
              </View>
              {defaultAccount && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailSubVal}>Bank: {defaultAccount.bank_name}</Text>
                </View>
              )}
            </>
          )}

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailKeySmall}>From</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Contribiia Wallet</Text>
          </View>
        </View>

        <Text style={styles.note}>
          <Text style={styles.noteBold}>Note</Text>
          {isDeposit
            ? ': bank processing time applies. Please be Patient!'
            : ': The amount has been disbursed from our side immediately but bank processing time applies. Please be Patient!'}
        </Text>

        <TouchableOpacity
          style={styles.goToWalletBtn}
          onPress={() => router.replace('/(tabs)/wallet' as any)}
        >
          <Text style={styles.goToWalletBtnText}>Go to Wallet</Text>
        </TouchableOpacity>

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
    alignItems: 'center',
    gap: 20,
  },
  banner: {
    backgroundColor: Colors.primary,
    width: '100%',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  bannerText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textDark,
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    width: '100%',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailKey: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
  },
  detailKeySmall: {
    fontSize: 12,
    color: Colors.textLight,
  },
  detailVal: {
    fontSize: 14,
    color: Colors.textDark,
  },
  detailSubVal: {
    fontSize: 13,
    color: Colors.textMid,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  copyBtn: {
    padding: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  note: {
    fontSize: 13,
    color: Colors.textMid,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  noteBold: {
    fontWeight: '700',
    color: Colors.textDark,
  },
  goToWalletBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  goToWalletBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
