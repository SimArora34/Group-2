import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import { Colors } from '../../constants/Colors';

const TERMS_INTRO =
  'By accessing or otherwise using this app, you agree to be bound by these Terms of Use.';

const TERMS_SECTIONS = [
  {
    title: 'Terms of Use',
    body: 'Contriibia provides this mobile application for lawful personal and business use. You agree to use the app only for legitimate savings, payment, and account management activities. You must not use the service to commit fraud, abuse other users, or violate any applicable law.',
  },
  {
    title: 'Use License',
    body: 'We grant you a limited, non-exclusive, non-transferable, revocable license to use the app for its intended purpose. This license does not allow resale, reverse engineering, unauthorized copying, or any use that attempts to interfere with platform security or service availability.',
  },
  {
    title: 'Security',
    body: 'You are responsible for protecting your account credentials, device access, and any verification methods connected to your profile. Notify us immediately if you suspect unauthorized access. We may require additional verification steps to protect your account and other users.',
  },
  {
    title: 'User Rights and Responsibilities',
    body: 'You retain rights to your personal information subject to applicable privacy laws, and you are responsible for ensuring that information you provide is accurate and up to date. You agree to complete identity and compliance steps when requested to maintain safe participation in the platform.',
  },
  {
    title: 'Payment Terms',
    body: 'All payment, transfer, and wallet activities are subject to availability, verification, and compliance review. Processing times can vary by payment rail and financial institution. You are responsible for reviewing transaction details before confirmation and for maintaining sufficient funds where required.',
  },
  {
    title: 'Privacy Policy',
    body: 'We collect and process account, identity, and transaction information to provide and secure the service. Information is used for account operations, support, fraud prevention, and legal compliance. Please review our Privacy Policy for details about collection, storage, and permitted sharing.',
  },
  {
    title: 'Intellectual Property Rights',
    body: 'All app content, branding, logos, software, and related materials are owned by Contriibia or its licensors and are protected by intellectual property laws. You may not copy, distribute, or create derivative works without prior written permission.',
  },
  {
    title: 'Termination and Suspension',
    body: 'We may suspend or terminate access where required to protect users, meet legal obligations, or address violations of these terms. You may stop using the service at any time. Certain obligations, including compliance and recordkeeping requirements, may survive account closure as required by law.',
  },
  {
    title: 'Dispute Resolution',
    body: 'If a dispute arises, contact support first so we can attempt resolution in good faith. If unresolved, disputes will be handled according to applicable law and the dispute process defined by Contriibia. Nothing in this section limits rights that cannot be waived under governing law.',
  },
];

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.logoRow}>
        <Logo size="medium" showTagline />
      </View>

      <Text style={styles.heading}>Terms and Conditions</Text>

      <ScrollView style={styles.scrollBox} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.introText}>{TERMS_INTRO}</Text>
        {TERMS_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.bodyText}>{section.body}</Text>
          </View>
        ))}
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
  introText: {
    fontSize: 14,
    color: Colors.textDark,
    lineHeight: 22,
    marginBottom: 14,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 6,
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
