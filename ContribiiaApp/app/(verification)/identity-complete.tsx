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

const CURRENT_STEP = 2;

export default function IdentityCompleteScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <Logo size="large" showTagline />

        <Text style={styles.heading}>
          One more step and your Contribiia savings journey can begin.
        </Text>

        <View style={styles.stepsContainer}>
          {STEPS.map((step) => {
            const isDone = step.num < CURRENT_STEP;
            const isActive = step.num === CURRENT_STEP;

            return (
              <View
                key={step.num}
                style={[
                  styles.stepRow,
                  isActive && styles.stepRowActive,
                  isDone && styles.stepRowDone,
                ]}
              >
                <View
                  style={[
                    styles.numCircle,
                    isDone && styles.numCircleDone,
                    isActive && styles.numCircleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.numText,
                      (isDone || isActive) && styles.numTextDone,
                    ]}
                  >
                    {isDone ? '✓' : step.num}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.stepLabel,
                    (isDone || isActive) && styles.stepLabelDone,
                  ]}
                >
                  {step.label}
                </Text>

                {isActive && <Text style={styles.stepArrow}>›</Text>}
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          label="Link bank account"
          onPress={() => router.push('/(verification)/bank-intro')}
        />
        <Button
          label="Skip for now"
          variant="ghost"
          onPress={() => router.replace('/(tabs)/DashboardScreen')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  body: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
    lineHeight: 28,
  },
  stepsContainer: { width: '100%', gap: 10 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 16,
    gap: 14,
  },
  stepRowActive: { borderColor: Colors.primary },
  stepRowDone: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  numCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  numCircleDone: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  numCircleActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  numText: { fontSize: 13, fontWeight: '700', color: Colors.textLight },
  numTextDone: { color: Colors.white },
  stepLabel: { flex: 1, fontSize: 15, color: Colors.textLight },
  stepLabelDone: { color: Colors.textDark, fontWeight: '500' },
  stepArrow: { fontSize: 22, color: Colors.primary },
  actions: { padding: 24, gap: 8 },
});
