import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/Button';
import ScreenHeader from '../../../components/ScreenHeader';
import { Colors } from '../../../constants/Colors';

type Phase = 'camera' | 'preview';

export default function DocumentUploadScreen() {
  const { docType, docLabel } = useLocalSearchParams<{ docType: string; docLabel: string }>();
  const [phase, setPhase] = useState<Phase>('camera');
  const label = docLabel || 'Document';

  // Simulate capture
  const handleCapture = () => setPhase('preview');

  if (phase === 'camera') {
    return (
      <View style={styles.cameraContainer}>
        {/* Camera placeholder */}
        <View style={styles.cameraBackground}>
          <Text style={styles.cameraHint}>Center your {label.toLowerCase()} in the box.</Text>
          <View style={styles.scanBox}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            {/* Document placeholder inside scan box */}
            <View style={styles.docPlaceholder}>
              <Text style={styles.docPlaceholderText}>📄</Text>
              <Text style={styles.docPlaceholderLabel}>[ Document preview ]</Text>
            </View>
          </View>
          {/* Camera controls */}
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.captureBtn} onPress={handleCapture} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Identity Verification" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Government ID – {label}</Text>

        {/* Document image placeholder */}
        <View style={styles.docPreview}>
          <Text style={styles.docPreviewEmoji}>🪪</Text>
          <Text style={styles.docPreviewText}>[ {label} Image ]</Text>
        </View>

        <Text style={styles.uploadedMsg}>Your {label.toLowerCase()} photo has been uploaded.</Text>
        <Text style={styles.uploadedSubMsg}>
          Choose another document to complete your identity verification.
        </Text>
      </ScrollView>
      <View style={styles.actions}>
        <Button
          label="Choose second document"
          onPress={() =>
            router.push({
              pathname: '/(verification)/document-upload-2',
              params: { firstDoc: docType },
            })
          }
        />
        <Button label="Change document" variant="outline" onPress={() => setPhase('camera')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: 24, flexGrow: 1 },
  heading: { fontSize: 18, fontWeight: '700', color: Colors.textDark, marginBottom: 20 },

  // Camera
  cameraContainer: { flex: 1, backgroundColor: '#1a1007' },
  cameraBackground: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  cameraHint: { color: Colors.white, fontSize: 16, fontWeight: '600', textAlign: 'center', paddingHorizontal: 24 },
  scanBox: {
    width: 300,
    height: 200,
    borderWidth: 0,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute', width: 24, height: 24,
    borderColor: 'rgba(255,255,255,0.7)', borderStyle: 'dashed',
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 },
  docPlaceholder: {
    width: 280,
    height: 180,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    borderStyle: 'dashed',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  docPlaceholderText: { fontSize: 48, marginBottom: 8 },
  docPlaceholderLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  cameraControls: { alignItems: 'center' },
  captureBtn: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: Colors.white, borderWidth: 4, borderColor: 'rgba(255,255,255,0.5)',
  },

  // Preview
  docPreview: {
    height: 200,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  docPreviewEmoji: { fontSize: 64, marginBottom: 8 },
  docPreviewText: { fontSize: 13, color: Colors.textLight, fontStyle: 'italic' },
  uploadedMsg: { fontSize: 15, fontWeight: '600', color: Colors.textDark, marginBottom: 8 },
  uploadedSubMsg: { fontSize: 13, color: Colors.textMid, lineHeight: 20 },
  actions: { padding: 24, gap: 8 },
});
