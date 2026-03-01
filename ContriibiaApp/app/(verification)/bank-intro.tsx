import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import ScreenHeader from '../../components/ScreenHeader';
import { Colors } from '../../constants/Colors';

export default function BankIntroScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Identity Verification" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Let's link your bank account.</Text>

        <Text style={styles.body}>
          In a Contribiia savings club, all payments are automatically withdrawn from a linked bank
          account. This ensures that participants make contributions on time.
        </Text>
        <Text style={styles.body}>
          Therefore, linking a bank account is required to participate in Contribiia.
        </Text>

        {/* Icon row placeholder */}
        <View style={styles.connectionRow}>
          <View style={styles.iconBox}><Text style={styles.iconEmoji}>〰</Text></View>
          <View style={styles.dashes}><Text style={styles.dashText}>- - - - -</Text></View>
          <View style={styles.iconBox}><Text style={styles.iconEmoji}>🏦</Text></View>
        </View>

        <Text style={styles.secureLabel}>Secure portal link</Text>
        <Text style={styles.body}>
          Contribiia will need the following information to link your bank account:
        </Text>
        {['Full name', 'Account and routing number', 'Bank balance'].map((item) => (
          <Text key={item} style={styles.bullet}>• {item}</Text>
        ))}
        <Text style={styles.privacyNote}>
          Your personal data will not be shared with anyone else.
        </Text>

        <View style={styles.legalBox}>
          <Text style={styles.legalText}>
            Contribiia is authorised by XXXXX Agency and more legalese goes here in the rest of the
            sentence. Something about having no guarantee of your money and risk and all that legal
            disclaimer.
          </Text>
        </View>

        <Text style={styles.choiceLabel}>
          To link your bank account, you have two secure options, encrypted by XXXXX:
        </Text>
      </ScrollView>
      <View style={styles.actions}>
        <Button label="Use secure portal" onPress={() => router.push('/(verification)/bank-portal')} />
        <Button label="Enter details manually" variant="ghost" onPress={() => router.push('/(verification)/bank-manual')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: 24, flexGrow: 1 },
  heading: { fontSize: 20, fontWeight: '700', color: Colors.textDark, marginBottom: 16 },
  body: { fontSize: 13, color: Colors.textMid, lineHeight: 20, marginBottom: 12 },
  connectionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginVertical: 20, gap: 8
  },
  iconBox: {
    width: 52, height: 52, borderRadius: 8,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.primary,
  },
  iconEmoji: { fontSize: 24 },
  dashes: { flex: 1, alignItems: 'center' },
  dashText: { color: Colors.primary, fontSize: 14, letterSpacing: 2 },
  secureLabel: { fontSize: 15, fontWeight: '700', color: Colors.textDark, marginBottom: 8 },
  bullet: { fontSize: 13, color: Colors.textMid, lineHeight: 22, marginLeft: 4 },
  privacyNote: { fontSize: 12, color: Colors.textLight, marginTop: 8, marginBottom: 12 },
  legalBox: {
    padding: 12, backgroundColor: Colors.surface,
    borderRadius: 6, borderWidth: 1, borderColor: Colors.border, marginBottom: 16,
  },
  legalText: { fontSize: 11, color: Colors.textLight, lineHeight: 16 },
  choiceLabel: { fontSize: 13, color: Colors.textDark, lineHeight: 20 },
  actions: { padding: 24, gap: 8 },
});
