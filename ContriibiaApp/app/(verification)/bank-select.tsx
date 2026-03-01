import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import ScreenHeader from '../../components/ScreenHeader';
import { Colors } from '../../constants/Colors';
import mockData from '../../data/mockData.json';

export default function BankSelectScreen() {
  const handleSelect = (bankId: string, bankName: string) => {
    router.push({ pathname: '/(verification)/bank-2fa', params: { bankId, bankName } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Identity Verification" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Secure portal link</Text>
        <Text style={styles.subheading}>
          Please select the bank that you would like to link your Contribiia account with.
        </Text>

        {mockData.banks.map((bank) => (
          <TouchableOpacity
            key={bank.id}
            style={styles.bankRow}
            onPress={() => handleSelect(bank.id, bank.name)}
          >
            {/* Bank logo placeholder */}
            <View style={styles.bankLogo}>
              <Text style={styles.bankLogoText}>{bank.name.slice(0, 2).toUpperCase()}</Text>
            </View>
            <Text style={styles.bankName}>{bank.name}</Text>
            <Text style={styles.bankArrow}>›</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.bankRow, styles.bankRowLast]}
          onPress={() => router.push('/(verification)/bank-manual')}
        >
          <View style={[styles.bankLogo, styles.bankLogoGray]}>
            <Text style={styles.bankLogoText}>?</Text>
          </View>
          <Text style={styles.bankName}>My bank is not listed above</Text>
          <Text style={styles.bankArrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.actions}>
        <Button label="Back" variant="outline" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: 24, flexGrow: 1 },
  heading: { fontSize: 20, fontWeight: '700', color: Colors.textDark, marginBottom: 8 },
  subheading: { fontSize: 13, color: Colors.textMid, lineHeight: 20, marginBottom: 20 },
  bankRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    padding: 14, marginBottom: 10, gap: 12,
  },
  bankRowLast: { borderStyle: 'dashed' },
  bankLogo: {
    width: 40, height: 40, borderRadius: 6,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  bankLogoGray: { backgroundColor: Colors.disabled },
  bankLogoText: { color: Colors.white, fontWeight: '800', fontSize: 14 },
  bankName: { flex: 1, fontSize: 15, color: Colors.textDark, fontWeight: '500' },
  bankArrow: { fontSize: 20, color: Colors.primary },
  actions: { padding: 24 },
});
