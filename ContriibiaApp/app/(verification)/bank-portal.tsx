import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import ScreenHeader from '../../components/ScreenHeader';
import { Colors } from '../../constants/Colors';

export default function BankPortalScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Identity Verification" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Secure portal link</Text>

        {/* Connection icon row */}
        <View style={styles.connectionRow}>
          <View style={styles.iconBox}><Text style={styles.iconEmoji}>〰</Text></View>
          <View style={styles.dashes}><Text style={styles.dashText}>- - - - -</Text></View>
          <View style={styles.iconBox}><Text style={styles.iconEmoji}>🏦</Text></View>
        </View>

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
      </ScrollView>
      <View style={styles.actions}>
        <Button label="Use secure portal" onPress={() => router.push('/(verification)/bank-select')} />
        <Button label="Enter details manually" variant="ghost" onPress={() => router.push('/(verification)/bank-manual')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: 24, flexGrow: 1 },
  heading: { fontSize: 20, fontWeight: '700', color: Colors.textDark, marginBottom: 20 },
  connectionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, gap: 8,
  },
  iconBox: {
    width: 52, height: 52, borderRadius: 8,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.primary,
  },
  iconEmoji: { fontSize: 24 },
  dashes: { flex: 1, alignItems: 'center' },
  dashText: { color: Colors.primary, fontSize: 14, letterSpacing: 2 },
  body: { fontSize: 13, color: Colors.textMid, lineHeight: 20, marginBottom: 12 },
  bullet: { fontSize: 13, color: Colors.textMid, lineHeight: 22, marginLeft: 4 },
  privacyNote: { fontSize: 12, color: Colors.textLight, marginTop: 8, marginBottom: 16 },
  legalBox: {
    padding: 12, backgroundColor: Colors.surface,
    borderRadius: 6, borderWidth: 1, borderColor: Colors.border,
  },
  legalText: { fontSize: 11, color: Colors.textLight, lineHeight: 16 },
  actions: { padding: 24, gap: 8 },
});
