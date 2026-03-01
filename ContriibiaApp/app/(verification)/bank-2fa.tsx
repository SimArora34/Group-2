import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import ScreenHeader from '../../components/ScreenHeader';
import { Colors } from '../../constants/Colors';

const CODE_LENGTH = 5;
const MOCK_CODE = '12345';

export default function Bank2FAScreen() {
  const { bankName } = useLocalSearchParams<{ bankName: string }>();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (val: string, idx: number) => {
    if (!/^\d*$/.test(val)) return;
    const newCode = [...code];
    newCode[idx] = val.slice(-1);
    setCode(newCode);
    if (val && idx < CODE_LENGTH - 1) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleContinue = () => {
    const entered = code.join('');
    if (entered.length < CODE_LENGTH) {
      Alert.alert('Error', 'Please enter the complete code');
      return;
    }
    if (entered !== MOCK_CODE) {
      Alert.alert('Invalid Code', `Incorrect code. (Hint: use ${MOCK_CODE})`);
      return;
    }
    router.push({ pathname: '/(verification)/bank-account-type', params: { bankName } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Identity Verification" />
      <View style={styles.scroll}>
        {/* Bank logo placeholder */}
        <View style={styles.bankLogoRow}>
          <View style={styles.bankLogo}>
            <Text style={styles.bankLogoText}>{(bankName || 'BK').slice(0, 2).toUpperCase()}</Text>
          </View>
          <Text style={styles.bankName}>{bankName || 'Bank'}</Text>
        </View>

        <Text style={styles.heading}>Two-factor authentication</Text>
        <Text style={styles.subheading}>
          Please enter the code sent to the account phone number or in your authenticator app.
        </Text>

        <View style={styles.codeRow}>
          {code.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(r) => { inputs.current[idx] = r; }}
              style={styles.codeBox}
              value={digit}
              onChangeText={(v) => handleChange(v, idx)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>
      </View>
      <View style={styles.actions}>
        <Button label="Continue" onPress={handleContinue} />
        <Button label="Back" variant="ghost" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { flex: 1, padding: 24 },
  bankLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  bankLogo: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  bankLogoText: { color: Colors.white, fontWeight: '800', fontSize: 18 },
  bankName: { fontSize: 22, fontWeight: '700', color: Colors.textDark },
  heading: { fontSize: 18, fontWeight: '700', color: Colors.textDark, marginBottom: 8 },
  subheading: { fontSize: 13, color: Colors.textMid, lineHeight: 20, marginBottom: 28 },
  codeRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  codeBox: {
    width: 50, height: 56, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 8, fontSize: 22, fontWeight: '700', color: Colors.textDark,
    backgroundColor: Colors.surface,
  },
  actions: { padding: 24, gap: 8 },
});
