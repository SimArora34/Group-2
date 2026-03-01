import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import { Colors } from '../../constants/Colors';
import mockData from '../../data/mockData.json';

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.logoRow}>
        <Logo size="medium" showTagline />
      </View>

      <Text style={styles.heading}>Terms and Conditions</Text>

      <ScrollView style={styles.scrollBox} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.bodyText}>{mockData.termsAndConditions}</Text>
      </ScrollView>

      <View style={styles.actions}>
        <Button
          label="Return to creating an account"
          variant="outline"
          onPress={() => router.back()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  logoRow: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  scrollBox: {
    flex: 1,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    padding: 16,
  },
  bodyText: {
    fontSize: 14,
    color: Colors.textMid,
    lineHeight: 22,
  },
  actions: {
    padding: 24,
  },
});
