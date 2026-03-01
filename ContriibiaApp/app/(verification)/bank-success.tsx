import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import ScreenHeader from '../../components/ScreenHeader';
import { Colors } from '../../constants/Colors';

export default function BankSuccessScreen() {
  const { bankName } = useLocalSearchParams<{ bankName: string }>();

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

        {/* Success icon */}
        <View style={styles.successIcon}>
          <Text style={styles.successCheck}>✓</Text>
        </View>

        <Text style={styles.successTitle}>Success!</Text>
        <Text style={styles.successMsg}>
          You have linked your bank account successfully.{'\n\n'}
          You can change or add an additional bank accounts in the Settings.
        </Text>
      </View>
      <View style={styles.actions}>
        <Button label="Continue" onPress={() => router.push('/(verification)/complete')} />
        <Button label="Back" variant="ghost" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  body: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 16 },
  bankLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  bankLogo: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  bankLogoText: { color: Colors.white, fontWeight: '800', fontSize: 18 },
  bankName: { fontSize: 22, fontWeight: '700', color: Colors.textDark },
  successIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  successCheck: { color: Colors.white, fontSize: 40, fontWeight: '700' },
  successTitle: { fontSize: 22, fontWeight: '700', color: Colors.textDark },
  successMsg: { fontSize: 14, color: Colors.textMid, textAlign: 'center', lineHeight: 22, paddingHorizontal: 12 },
  actions: { padding: 24, gap: 8 },
});
