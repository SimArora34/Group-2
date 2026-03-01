import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/Button';
import ScreenHeader from '../../../components/ScreenHeader';
import { Colors } from '../../../constants/Colors';

export default function DocumentConfirmScreen() {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Identity Verification" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Your selected documents:</Text>

        {/* Document 1 */}
        <Text style={styles.docTitle}>Government ID – Passport</Text>
        <TouchableOpacity style={styles.docCard} activeOpacity={0.8}>
          <View style={styles.docImagePlaceholder}>
            <Text style={styles.docEmoji}>🪪</Text>
            <Text style={styles.docImageLabel}>[ Passport Image ]</Text>
            <Text style={styles.enlargeText}>Click to enlarge</Text>
          </View>
        </TouchableOpacity>

        {/* Document 2 */}
        <Text style={styles.docTitle}>Recent public utility bill</Text>
        <TouchableOpacity style={styles.docCard} activeOpacity={0.8}>
          <View style={styles.docImagePlaceholder}>
            <Text style={styles.docEmoji}>📃</Text>
            <Text style={styles.docImageLabel}>[ Utility Bill Image ]</Text>
            <Text style={styles.enlargeText}>Click to enlarge</Text>
          </View>
        </TouchableOpacity>

        {/* Confirmation checkbox */}
        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setConfirmed((v) => !v)}
        >
          <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
            {confirmed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>
            I confirm that these documents belong to me and understand that impersonation is a crime.
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.actions}>
        <Button
          label="Complete identity verification"
          onPress={() => router.replace('/(verification)/identity-complete')}
          disabled={!confirmed}
        />
        <Button label="Change Documents" variant="outline" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: 24, flexGrow: 1 },
  heading: { fontSize: 20, fontWeight: '700', color: Colors.textDark, marginBottom: 20 },
  docTitle: { fontSize: 15, fontWeight: '600', color: Colors.textDark, marginBottom: 10 },
  docCard: { marginBottom: 20 },
  docImagePlaceholder: {
    height: 140,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  docEmoji: { fontSize: 40 },
  docImageLabel: { fontSize: 12, color: Colors.textLight, fontStyle: 'italic' },
  enlargeText: { fontSize: 11, color: Colors.primary, fontWeight: '500', marginTop: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 8 },
  checkbox: {
    width: 20, height: 20, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 3, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkmark: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  checkLabel: { flex: 1, fontSize: 13, color: Colors.textMid, lineHeight: 20 },
  actions: { padding: 24, gap: 8 },
});
