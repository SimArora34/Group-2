import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import { Colors } from '../../constants/Colors';

export default function PasswordSuccessScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.logoRow}>
        <Logo size="large" showTagline />
      </View>

      <View style={styles.body}>
        <Text style={styles.heading}>Successful</Text>

        {/* Success icon placeholder */}
        <View style={styles.iconCircle}>
          <Text style={styles.iconCheck}>✓</Text>
        </View>

        <Text style={styles.congratsTitle}>Congratulations!</Text>
        <Text style={styles.congratsText}>
          Your password has been changed.{'\n'}Click Continue to login
        </Text>
      </View>

      <View style={styles.actions}>
        <Button label="Get Started" onPress={() => router.replace('/(auth)/login')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  logoRow: { alignItems: 'center', paddingTop: 24, paddingBottom: 8 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  heading: { fontSize: 22, fontWeight: '700', color: Colors.textDark, marginBottom: 28 },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconCheck: { color: Colors.white, fontSize: 44, fontWeight: '700' },
  congratsTitle: { fontSize: 20, fontWeight: '700', color: Colors.textDark, marginBottom: 10 },
  congratsText: { fontSize: 14, color: Colors.textMid, textAlign: 'center', lineHeight: 20 },
  actions: { padding: 24 },
});
