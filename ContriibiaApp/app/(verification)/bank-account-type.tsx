import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import ScreenHeader from '../../components/ScreenHeader';
import { Colors } from '../../constants/Colors';

const ACCOUNT_TYPES = ['Checking account', 'Savings account'];

export default function BankAccountTypeScreen() {
  const { bankName } = useLocalSearchParams<{ bankName: string }>();
  const [selected, setSelected] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!selected) return;
    router.push({ pathname: '/(verification)/bank-success', params: { bankName } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Identity Verification" />
      <View style={styles.body}>
        {/* Bank logo */}
        <View style={styles.bankLogoRow}>
          <View style={styles.bankLogo}>
            <Text style={styles.bankLogoText}>{(bankName || 'BK').slice(0, 2).toUpperCase()}</Text>
          </View>
          <Text style={styles.bankName}>{bankName || 'Bank'}</Text>
        </View>

        <Text style={styles.heading}>Select which account you will use with Contribiia.</Text>

        {ACCOUNT_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={styles.radioRow}
            onPress={() => setSelected(type)}
          >
            <View style={[styles.radio, selected === type && styles.radioSelected]}>
              {selected === type && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.actions}>
        <Button label="Confirm" onPress={handleConfirm} disabled={!selected} />
        <Button label="Back" variant="ghost" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  body: { flex: 1, padding: 24 },
  bankLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 },
  bankLogo: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  bankLogoText: { color: Colors.white, fontWeight: '800', fontSize: 18 },
  bankName: { fontSize: 22, fontWeight: '700', color: Colors.textDark },
  heading: { fontSize: 16, fontWeight: '600', color: Colors.textDark, marginBottom: 20, lineHeight: 24 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: Colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  radioLabel: { fontSize: 15, color: Colors.textDark },
  actions: { padding: 24, gap: 8 },
});
