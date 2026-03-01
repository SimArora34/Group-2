import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import { Colors } from '../../constants/Colors';

const STEPS = [
  { num: 1, label: 'Verify your identity' },
  { num: 2, label: 'Link bank account' },
  { num: 3, label: 'Start saving!' },
];

export default function CompleteScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <Logo size="large" showTagline />

        <Text style={styles.heading}>You are ready to join a savings club!</Text>

        <View style={styles.stepsContainer}>
          {STEPS.map((step) => (
            <View key={step.num} style={styles.stepRow}>
              <View style={styles.numCircle}>
                <Text style={styles.checkText}>✓</Text>
              </View>
              <Text style={styles.stepLabel}>{step.label}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.actions}>
        <Button label="Start Saving" onPress={() => router.replace('/(tabs)')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  body: { flex: 1, padding: 32, alignItems: 'center', justifyContent: 'center', gap: 28 },
  heading: {
    fontSize: 22, fontWeight: '700', color: Colors.textDark,
    textAlign: 'center', lineHeight: 30,
  },
  stepsContainer: { width: '100%', gap: 10 },
  stepRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.primary,
    borderRadius: 8, padding: 16, gap: 14,
    backgroundColor: Colors.primaryLight,
  },
  numCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  checkText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  stepLabel: { flex: 1, fontSize: 15, color: Colors.textDark, fontWeight: '600' },
  actions: { padding: 24 },
});
