import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import ScreenHeader from '../../components/ScreenHeader';
import { Colors } from '../../constants/Colors';

export default function IdentityIntroScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Identity Verification" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Let's verify your identity.</Text>

        <Text style={styles.body}>
          We are legally mandated to verify your identity in order to conduct business in Canada.
        </Text>
        <Text style={styles.body}>
          For security, all users of Contribiia are required to verify their identity before
          participating in a savings club.
        </Text>
        <Text style={styles.body}>
          Your information is encrypted and will not be used outside of confirming your identity.
        </Text>

        {/* Legal disclaimer placeholder */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Contribiia is authorised by XXXXX Agency and more legalese goes here in the rest of the
            sentence. Something about having no guarantee of your money and risk and all that legal
            disclaimer.
          </Text>
        </View>
      </ScrollView>
      <View style={styles.actions}>
        <Button label="Verify identity" onPress={() => router.push('/(verification)/legal-name')} />
        <Button label="Save and exit" variant="ghost" onPress={() => router.replace('/(tabs)')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: 24, flexGrow: 1 },
  heading: { fontSize: 22, fontWeight: '700', color: Colors.textDark, marginBottom: 20 },
  body: { fontSize: 14, color: Colors.textMid, lineHeight: 22, marginBottom: 14 },
  disclaimer: {
    marginTop: 24,
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disclaimerText: { fontSize: 11, color: Colors.textLight, lineHeight: 16 },
  actions: { padding: 24, gap: 8 },
});
